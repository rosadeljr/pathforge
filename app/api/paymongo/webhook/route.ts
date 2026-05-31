import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import {
  createPaymentFromSource,
  verifyWebhookSignature,
  PayMongoApiError,
} from "@/lib/payments/paymongo";
import { track } from "@/lib/analytics/track";

/**
 * PayMongo webhook handler.
 *
 * Webhook URL to register in PayMongo dashboard:
 *   https://your-domain.com/api/paymongo/webhook
 *
 * Events to subscribe:
 *   - source.chargeable   → user finished payment in GCash/Maya; capture it.
 *   - payment.paid        → payment settled; mark the user as upgraded.
 *   - payment.failed      → settlement failed; mark as rejected.
 *
 * Required env vars:
 *   PAYMONGO_SECRET_KEY        — used by createPaymentFromSource()
 *   PAYMONGO_WEBHOOK_SECRET    — used by verifyWebhookSignature()
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  — service role bypasses RLS for status updates
 *
 * Idempotency: PayMongo retries on non-2xx responses, so we always
 * acknowledge with 200 once the signature is valid. Inside, we use the
 * external_id lookup to find the originating payment_request and skip
 * work that's already been done (e.g. payment.paid arriving twice).
 */

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface PayMongoEvent {
  data: {
    id: string;
    attributes: {
      type: string;
      data: {
        id: string;
        attributes: {
          type?: string;
          status?: string;
          amount?: number;
          currency?: string;
          metadata?: Record<string, string>;
        };
      };
    };
  };
}

export async function POST(request: NextRequest) {
  // Read raw body once — we need the EXACT bytes for HMAC verification,
  // not the JSON-roundtripped version.
  const rawBody = await request.text();
  const signature = request.headers.get("paymongo-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Don't leak whether the secret was wrong vs the timestamp was stale —
    // both look the same to the caller.
    console.warn("[paymongo/webhook] signature verification failed");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let event: PayMongoEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = event?.data?.attributes?.type;
  const resource = event?.data?.attributes?.data;
  if (!eventType || !resource) {
    return NextResponse.json({ ok: true, ignored: "shape" });
  }

  const supabase = getServiceClient();

  try {
    if (eventType === "source.chargeable") {
      await handleSourceChargeable(supabase, resource);
    } else if (eventType === "payment.paid") {
      await handlePaymentPaid(supabase, resource);
    } else if (eventType === "payment.failed") {
      await handlePaymentFailed(supabase, resource);
    }
    // Any other event type (e.g. source.expired, source.cancelled): no-op,
    // but acknowledge so PayMongo stops retrying.
  } catch (e) {
    // Log and 200 — replay would loop forever on a permanent failure.
    console.error("[paymongo/webhook] handler error:", e);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Source became chargeable. Create the Payment to actually move money,
 * and store the new payment id as external_id (the source id is no
 * longer the relevant pointer).
 */
interface ChargeableRow {
  id: string;
  tier: string;
  amount_php: number;
  user_id: string;
  status: string;
  external_id: string | null;
}

async function handleSourceChargeable(
  supabase: ReturnType<typeof getServiceClient>,
  resource: PayMongoEvent["data"]["attributes"]["data"]
) {
  const sourceId = resource.id;
  const meta = resource.attributes.metadata || {};
  const paymentRequestId = meta.payment_request_id;

  // Prefer the metadata pointer (precise). Fall back to external_id match
  // for safety.
  let prRow: ChargeableRow | null = null;
  if (paymentRequestId) {
    const r = await supabase
      .from("payment_requests")
      .select("id, tier, amount_php, user_id, status, external_id")
      .eq("id", paymentRequestId)
      .maybeSingle();
    prRow = (r.data as ChargeableRow | null) ?? null;
  }
  if (!prRow) {
    const r = await supabase
      .from("payment_requests")
      .select("id, tier, amount_php, user_id, status, external_id")
      .eq("external_id", sourceId)
      .maybeSingle();
    prRow = (r.data as ChargeableRow | null) ?? null;
  }
  if (!prRow) {
    console.warn(
      "[paymongo/webhook] source.chargeable could not find payment_request for source",
      sourceId
    );
    return;
  }
  if (prRow.status !== "pending") {
    // Already moved past pending — nothing to do.
    return;
  }

  let payment;
  try {
    payment = await createPaymentFromSource({
      sourceId,
      amountPhp: prRow.amount_php,
      description: `PathForge ${
        prRow.tier === "pro" ? "Pro" : "Family"
      } subscription`,
      metadata: {
        payment_request_id: prRow.id,
        user_id: prRow.user_id,
        tier: prRow.tier,
      },
    });
  } catch (e) {
    const err = e instanceof PayMongoApiError ? e : null;
    console.error("[paymongo/webhook] createPaymentFromSource failed:", err ?? e);
    await supabase
      .from("payment_requests")
      .update({
        external_status: "capture_failed",
        rejection_reason: err?.message ?? "Payment capture failed.",
      })
      .eq("id", prRow.id);
    return;
  }

  await supabase
    .from("payment_requests")
    .update({
      // Replace source id with the payment id so later payment.paid
      // events resolve via the same external_id lookup.
      external_id: payment.id,
      external_status: payment.status,
    })
    .eq("id", prRow.id);
}

/**
 * Payment settled — upgrade the user. Mirrors the admin approve flow in
 * /admin/payments so behaviour stays consistent regardless of provider.
 */
interface PaidRow {
  id: string;
  tier: string;
  user_id: string;
  status: string;
}

async function handlePaymentPaid(
  supabase: ReturnType<typeof getServiceClient>,
  resource: PayMongoEvent["data"]["attributes"]["data"]
) {
  const paymentId = resource.id;
  const meta = resource.attributes.metadata || {};
  const paymentRequestId = meta.payment_request_id;

  let prRow: PaidRow | null = null;
  if (paymentRequestId) {
    const r = await supabase
      .from("payment_requests")
      .select("id, tier, user_id, status")
      .eq("id", paymentRequestId)
      .maybeSingle();
    prRow = (r.data as PaidRow | null) ?? null;
  }
  if (!prRow) {
    const r = await supabase
      .from("payment_requests")
      .select("id, tier, user_id, status")
      .eq("external_id", paymentId)
      .maybeSingle();
    prRow = (r.data as PaidRow | null) ?? null;
  }
  if (!prRow) {
    console.warn(
      "[paymongo/webhook] payment.paid could not find payment_request for payment",
      paymentId
    );
    return;
  }
  if (prRow.status === "approved") {
    // Duplicate webhook — already done.
    return;
  }

  // 1. Mark payment_request as approved.
  await supabase
    .from("payment_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      external_status: "paid",
    })
    .eq("id", prRow.id);

  // 2. Upgrade the user's tier.
  await supabase
    .from("profiles")
    .update({ subscription_tier: prRow.tier })
    .eq("id", prRow.user_id);

  // 3. Best-effort subscription record (parallel to admin approval flow).
  try {
    await supabase.from("subscriptions").insert({
      user_id: prRow.user_id,
      tier: prRow.tier,
      status: "active",
    });
  } catch {
    /* subscriptions table is nice-to-have; tier is source of truth */
  }

  // 4. Ad-funnel: payment_approved attributed to the user, same as the
  //    manual admin-approve path.
  try {
    await track(supabase, prRow.user_id, "payment_approved", {
      payload: {
        tier: prRow.tier,
        payment_request_id: prRow.id,
        provider: "paymongo",
      },
    });
  } catch {
    /* analytics best-effort */
  }
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof getServiceClient>,
  resource: PayMongoEvent["data"]["attributes"]["data"]
) {
  const paymentId = resource.id;
  const { data: pr } = await supabase
    .from("payment_requests")
    .select("id, status")
    .eq("external_id", paymentId)
    .maybeSingle();
  if (!pr) return;
  if ((pr as any).status === "approved") return;
  await supabase
    .from("payment_requests")
    .update({
      status: "rejected",
      external_status: "failed",
      reviewed_at: new Date().toISOString(),
      rejection_reason: "Payment failed at provider.",
    })
    .eq("id", (pr as any).id);
}
