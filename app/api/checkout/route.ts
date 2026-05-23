import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

/**
 * Creates a Stripe Checkout Session for the requested subscription tier.
 *
 * Requires env vars:
 *   STRIPE_SECRET_KEY                    — Stripe secret key (sk_test_... or sk_live_...)
 *   STRIPE_PRICE_PRO                     — Stripe Price ID for Pro tier
 *   STRIPE_PRICE_ELITE                   — Stripe Price ID for Elite tier
 *   NEXT_PUBLIC_APP_URL                  — Public site URL (e.g. https://pathforger.app)
 */

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error apiVersion may differ across stripe sdk versions
    apiVersion: "2024-06-20",
  });
}

const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO,
  elite: process.env.STRIPE_PRICE_ELITE,
};

function getAppUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "https://pathforge-zeta.vercel.app"
  );
}

async function handleCheckout(request: NextRequest, tier: string) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments not configured. Please contact support." },
      { status: 503 }
    );
  }

  if (!tier || !["pro", "elite"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS];
  if (!priceId) {
    return NextResponse.json(
      { error: `${tier.toUpperCase()} price ID not configured.` },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create Stripe customer (idempotent via stripe_customer_id)
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, username, full_name")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      name: profile?.full_name ?? profile?.username ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = getAppUrl(request);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${appUrl}/learn?upgrade=success&tier=${tier}`,
    cancel_url: `${appUrl}/pricing?upgrade=cancelled`,
    metadata: {
      user_id: user.id,
      tier,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        tier,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tier: string = body?.tier || "pro";
    return await handleCheckout(request, tier);
  } catch (error: any) {
    console.error("[checkout] error:", error);
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}

// Also accept GET so the pricing page can use a simple redirect link
export async function GET(request: NextRequest) {
  try {
    const tier = new URL(request.url).searchParams.get("plan") || "pro";
    const result = await handleCheckout(request, tier);
    const data = await result.json();
    if (data.url) {
      return NextResponse.redirect(data.url, 303);
    }
    // Error response — redirect back to pricing with error message
    const appUrl = getAppUrl(request);
    return NextResponse.redirect(
      `${appUrl}/pricing?error=${encodeURIComponent(data.error || "checkout_failed")}`,
      303
    );
  } catch (error: any) {
    console.error("[checkout GET] error:", error);
    const appUrl = getAppUrl(request);
    return NextResponse.redirect(
      `${appUrl}/pricing?error=${encodeURIComponent(error.message || "checkout_failed")}`,
      303
    );
  }
}
