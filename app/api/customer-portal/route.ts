import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";

/**
 * Generates a Stripe Customer Portal session URL.
 * Users go here to manage / upgrade / downgrade / cancel their subscription.
 *
 * Configure the portal at: https://dashboard.stripe.com/settings/billing/portal
 */

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error apiVersion may differ across stripe sdk versions
    apiVersion: "2024-06-20",
  });
}

function getAppUrl(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    "https://pathforge-zeta.vercel.app"
  );
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Payments not configured." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    const appUrl = getAppUrl(request);
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("[customer-portal] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to open billing portal" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await POST(request);
    const data = await result.json();
    const appUrl = getAppUrl(request);
    if (data.url) {
      return NextResponse.redirect(data.url, 303);
    }
    return NextResponse.redirect(
      `${appUrl}/settings?error=${encodeURIComponent(data.error || "portal_failed")}`,
      303
    );
  } catch (error: any) {
    const appUrl = getAppUrl(request);
    return NextResponse.redirect(
      `${appUrl}/settings?error=${encodeURIComponent(error.message || "portal_failed")}`,
      303
    );
  }
}
