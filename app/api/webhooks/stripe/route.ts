import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

/**
 * Stripe webhook handler.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY         — same key used everywhere
 *   STRIPE_WEBHOOK_SECRET     — from Stripe Dashboard webhook endpoint
 *   STRIPE_PRICE_PRO          — Pro price ID
 *   STRIPE_PRICE_ELITE        — Elite price ID
 *   SUPABASE_SERVICE_ROLE_KEY — server-only key, bypasses RLS for writes
 *   NEXT_PUBLIC_SUPABASE_URL  — your Supabase project URL
 *
 * Webhook URL to register:
 *   https://your-domain.com/api/webhooks/stripe
 *
 * Events to subscribe to in Stripe Dashboard:
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.paid
 *   - invoice.payment_failed
 */

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error apiVersion may differ across sdk versions
    apiVersion: "2024-06-20",
  });
}

function getServiceClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function tierFromPriceId(priceId: string | undefined): "pro" | "elite" | "free" {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_ELITE) return "elite";
  return "free";
}

function tierFromSubscription(sub: Stripe.Subscription): "pro" | "elite" | "free" {
  // Try metadata first (we set it during checkout)
  const metaTier = sub.metadata?.tier;
  if (metaTier === "pro" || metaTier === "elite") return metaTier;

  // Fall back to price ID
  const priceId = sub.items.data[0]?.price?.id;
  return tierFromPriceId(priceId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("[stripe-webhook] signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      // -------------------- CHECKOUT COMPLETED --------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const tier = (session.metadata?.tier as "pro" | "elite") || "pro";

        if (!userId) {
          console.warn("[stripe-webhook] No user_id in checkout session metadata");
          break;
        }

        // Update profile subscription tier immediately on checkout success
        await supabase
          .from("profiles")
          .update({ subscription_tier: tier })
          .eq("id", userId);

        // The subscription.created event will fire right after with full subscription data
        console.log(`[stripe-webhook] checkout.session.completed: user ${userId} → ${tier}`);
        break;
      }

      // -------------------- SUBSCRIPTION CREATED / UPDATED --------------------
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        const tier = tierFromSubscription(subscription);

        if (!userId) {
          console.warn("[stripe-webhook] No user_id in subscription metadata");
          break;
        }

        const periodEnd = (subscription as any).current_period_end
          ? new Date(((subscription as any).current_period_end as number) * 1000).toISOString()
          : null;

        // Upsert subscription record
        await supabase
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              tier,
              status: subscription.status,
              provider: "stripe",
              provider_customer_id: subscription.customer as string,
              provider_subscription_id: subscription.id,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
            { onConflict: "provider_subscription_id" }
          );

        // Update profile tier (active sub → use that tier; cancelled → keep tier until period end)
        const isActive = ["active", "trialing"].includes(subscription.status);
        if (isActive) {
          await supabase
            .from("profiles")
            .update({ subscription_tier: tier })
            .eq("id", userId);
        }

        console.log(
          `[stripe-webhook] ${event.type}: user ${userId} → ${tier} (${subscription.status})`
        );
        break;
      }

      // -------------------- SUBSCRIPTION DELETED --------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.warn("[stripe-webhook] No user_id in deleted subscription");
          break;
        }

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("provider_subscription_id", subscription.id);

        // Downgrade to free
        await supabase
          .from("profiles")
          .update({ subscription_tier: "free" })
          .eq("id", userId);

        console.log(`[stripe-webhook] subscription cancelled: user ${userId}`);
        break;
      }

      // -------------------- INVOICE PAID / FAILED (audit only) --------------------
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe-webhook] invoice paid: customer ${invoice.customer}`);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Could send user a "payment failed" email here in the future
        console.warn(
          `[stripe-webhook] invoice payment failed: customer ${invoice.customer}`
        );
        break;
      }

      default:
        // Unhandled event types are fine — Stripe sends many
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[stripe-webhook] processing error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
