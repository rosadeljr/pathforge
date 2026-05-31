import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSource, PayMongoApiError } from "@/lib/payments/paymongo";

/**
 * POST /api/paymongo/create-source
 *
 * Auth required. Body: { tier: "pro" | "family", method: "gcash" | "paymaya" }.
 *
 * Creates a `payment_requests` row with provider='paymongo' and status='pending',
 * then a PayMongo Source for the same amount, attaches the source id as
 * `external_id`, and returns the source's `checkoutUrl` for the client to
 * window.location.assign(). The actual upgrade happens later via webhook.
 *
 * Returns: { checkoutUrl: string, paymentRequestId: string }
 */

export const dynamic = "force-dynamic";

const PRICE_BY_TIER: Record<"pro" | "family", number> = {
  pro: 149,
  family: 299,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { tier?: string; method?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const tier = body.tier;
  const method = body.method;
  if (tier !== "pro" && tier !== "family") {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  if (method !== "gcash" && method !== "paymaya") {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }
  const amountPhp = PRICE_BY_TIER[tier];

  // Build absolute return URLs from the incoming request so test/prod
  // both work without hard-coding origins.
  const origin = new URL(request.url).origin;
  const redirectSuccess = `${origin}/api/paymongo/return?status=success`;
  const redirectFailed = `${origin}/api/paymongo/return?status=failed`;

  // 1. Insert a pending payment_requests row. We don't know the Source ID
  //    yet — fill it in after the API call. If the PayMongo call later
  //    fails we still want a paper trail, so insert first.
  const { data: pr, error: insertErr } = await supabase
    .from("payment_requests")
    .insert({
      user_id: user.id,
      tier,
      amount_php: amountPhp,
      payment_method: method,
      provider: "paymongo",
      status: "pending",
      external_status: "creating",
    })
    .select("id")
    .single();
  if (insertErr || !pr) {
    console.error("[paymongo/create-source] insert failed:", insertErr);
    return NextResponse.json(
      { error: "Could not create payment request" },
      { status: 500 }
    );
  }

  // 2. Create the PayMongo Source.
  let source;
  try {
    source = await createSource({
      type: method,
      amountPhp,
      redirectSuccess,
      redirectFailed,
      description: `PathForge ${tier === "pro" ? "Pro" : "Family"} subscription`,
      metadata: {
        payment_request_id: pr.id,
        user_id: user.id,
        tier,
      },
    });
  } catch (e) {
    const err = e instanceof PayMongoApiError ? e : null;
    console.error("[paymongo/create-source] paymongo error:", err ?? e);
    // Mark the request as failed so admins see what happened.
    await supabase
      .from("payment_requests")
      .update({
        external_status: "create_failed",
        status: "rejected",
        rejection_reason:
          err?.message ?? "PayMongo Source creation failed. Try the manual method.",
      })
      .eq("id", pr.id);
    return NextResponse.json(
      { error: err?.message ?? "Payment provider error" },
      { status: 502 }
    );
  }

  if (!source.checkoutUrl) {
    await supabase
      .from("payment_requests")
      .update({
        external_status: "no_checkout_url",
        status: "rejected",
        rejection_reason: "PayMongo did not return a checkout URL.",
      })
      .eq("id", pr.id);
    return NextResponse.json(
      { error: "Payment provider did not return a checkout URL" },
      { status: 502 }
    );
  }

  // 3. Persist the Source id + status. The webhook will use external_id
  //    to find this row again later.
  await supabase
    .from("payment_requests")
    .update({
      external_id: source.id,
      external_status: source.status,
    })
    .eq("id", pr.id);

  return NextResponse.json({
    checkoutUrl: source.checkoutUrl,
    paymentRequestId: pr.id,
  });
}
