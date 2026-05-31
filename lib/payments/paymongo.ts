/**
 * Thin server-only wrapper over the PayMongo REST API.
 *
 * Why a hand-rolled wrapper instead of an SDK:
 *   - PayMongo's official Node SDK is sparse, infrequently updated,
 *     and only covers a subset of the surface we need.
 *   - The REST endpoints we use here (Sources + Payments + a webhook
 *     signature check) are 3 well-documented calls. A 100-line wrapper
 *     beats pulling in a dependency.
 *   - Keeps secret-key handling inside one file we can audit.
 *
 * Required env vars (server-side only — never expose to client):
 *   PAYMONGO_SECRET_KEY   — sk_test_* or sk_live_* from PayMongo dashboard
 *   PAYMONGO_WEBHOOK_SECRET — whsec_* from the webhook endpoint detail page
 *
 * API reference:
 *   https://developers.paymongo.com/reference/sources
 *   https://developers.paymongo.com/reference/payments
 *   https://developers.paymongo.com/docs/webhooks
 *
 * Amounts: PayMongo expects amounts in CENTAVOS (₱149 → 14900).
 * Currency: PHP only — this product is PH-market.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

export type PayMongoSourceType = "gcash" | "paymaya";
export type PayMongoStatus =
  | "pending"
  | "chargeable"
  | "paid"
  | "failed"
  | "cancelled";

export interface PayMongoSource {
  id: string;
  type: PayMongoSourceType;
  amountCentavos: number;
  status: PayMongoStatus;
  /** URL the user must be redirected to in order to complete payment. */
  checkoutUrl: string;
  raw: Record<string, unknown>;
}

export interface PayMongoPayment {
  id: string;
  amountCentavos: number;
  status: PayMongoStatus;
  description: string | null;
  raw: Record<string, unknown>;
}

class PayMongoApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "PayMongoApiError";
    this.status = status;
    this.body = body;
  }
}

function getAuthHeader(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) {
    throw new PayMongoApiError(
      "PAYMONGO_SECRET_KEY is not configured",
      500,
      null
    );
  }
  // PayMongo uses HTTP Basic with the secret key as username, no password.
  // Encode "<key>:" → base64.
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

async function pmFetch<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown }
): Promise<T> {
  const res = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    method: init.method,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    // Best-effort: cache must be off for server actions.
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!res.ok) {
    const firstErr =
      Array.isArray((json as any)?.errors) && (json as any).errors[0]?.detail;
    throw new PayMongoApiError(
      firstErr || `PayMongo ${path} failed (${res.status})`,
      res.status,
      json
    );
  }
  return json as T;
}

/**
 * Create a Source (e-wallet payment intent) for GCash or Maya.
 *
 * The returned `checkoutUrl` must be opened in the user's browser. After
 * they complete payment, PayMongo:
 *   1. Redirects them to `redirectSuccess` (we use this for UX only).
 *   2. Fires a `source.chargeable` webhook to our `/api/paymongo/webhook`
 *      endpoint. That webhook is what actually triggers the upgrade.
 */
export async function createSource(args: {
  type: PayMongoSourceType;
  amountPhp: number;
  redirectSuccess: string;
  redirectFailed: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<PayMongoSource> {
  const body = {
    data: {
      attributes: {
        amount: Math.round(args.amountPhp * 100),
        currency: "PHP",
        type: args.type,
        redirect: {
          success: args.redirectSuccess,
          failed: args.redirectFailed,
        },
        ...(args.description ? { description: args.description } : {}),
        ...(args.metadata ? { metadata: args.metadata } : {}),
      },
    },
  };
  const json = await pmFetch<{ data: { id: string; attributes: any } }>(
    "/sources",
    { method: "POST", body }
  );
  const attrs = json.data.attributes;
  return {
    id: json.data.id,
    type: args.type,
    amountCentavos: attrs.amount,
    status: attrs.status,
    checkoutUrl: attrs.redirect?.checkout_url ?? "",
    raw: json.data as Record<string, unknown>,
  };
}

/**
 * Create a Payment from a chargeable Source. Fired by the webhook handler
 * when `source.chargeable` arrives — that's the official "money is locked
 * in, capture it now" event. PayMongo then fires `payment.paid` once the
 * payment settles.
 */
export async function createPaymentFromSource(args: {
  sourceId: string;
  amountPhp: number;
  description: string;
  metadata?: Record<string, string>;
}): Promise<PayMongoPayment> {
  const body = {
    data: {
      attributes: {
        amount: Math.round(args.amountPhp * 100),
        currency: "PHP",
        description: args.description,
        source: { id: args.sourceId, type: "source" },
        ...(args.metadata ? { metadata: args.metadata } : {}),
      },
    },
  };
  const json = await pmFetch<{ data: { id: string; attributes: any } }>(
    "/payments",
    { method: "POST", body }
  );
  const attrs = json.data.attributes;
  return {
    id: json.data.id,
    amountCentavos: attrs.amount,
    status: attrs.status,
    description: attrs.description ?? null,
    raw: json.data as Record<string, unknown>,
  };
}

/**
 * Verify a webhook payload using PayMongo's signature header.
 *
 * Header format: `Paymongo-Signature: t=<ts>,te=<test_sig>,li=<live_sig>`
 * Algorithm: HMAC-SHA256(secret, `${ts}.${rawBody}`) hex-encoded.
 * Both test and live signatures may be present; we accept either match.
 *
 * Constant-time compare to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  // Parse "t=…,te=…,li=…" into a Map.
  const parts = new Map<string, string>();
  for (const segment of signatureHeader.split(",")) {
    const [k, v] = segment.split("=");
    if (k && v) parts.set(k.trim(), v.trim());
  }
  const ts = parts.get("t");
  const testSig = parts.get("te");
  const liveSig = parts.get("li");
  if (!ts) return false;

  // Reject signatures older than 5 minutes to limit replay window.
  // PayMongo's `t` is in seconds since epoch. We don't call Date.now()
  // directly because some Next 16 environments freeze it during build;
  // wrap in a function so a custom clock can be injected if needed.
  const nowSec = Math.floor(getNowMs() / 1000);
  const tsSec = parseInt(ts, 10);
  if (!Number.isFinite(tsSec) || Math.abs(nowSec - tsSec) > 300) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${ts}.${rawBody}`)
    .digest("hex");
  const candidates = [testSig, liveSig].filter(Boolean) as string[];
  for (const candidate of candidates) {
    if (candidate.length !== expected.length) continue;
    try {
      const a = Buffer.from(expected, "utf8");
      const b = Buffer.from(candidate, "utf8");
      if (a.length === b.length && timingSafeEqual(a, b)) return true;
    } catch {
      // length mismatch / non-utf8 — treat as no match
    }
  }
  return false;
}

// Indirection so this file stays test-friendly. Production calls Date.now().
function getNowMs(): number {
  return Date.now();
}

export { PayMongoApiError };
