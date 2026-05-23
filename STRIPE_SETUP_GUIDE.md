# Stripe Payment Setup Guide

Complete walkthrough to enable subscription payments on PathForge.
Total time: **30-45 minutes**.

---

## 📋 Overview

PathForge uses Stripe for subscription billing. The flow:

1. User clicks "Upgrade" on `/pricing`
2. App creates a Stripe Checkout Session → redirects to Stripe-hosted page
3. User enters card details on Stripe (we never see card data)
4. Stripe sends a webhook back to your app on payment success
5. Webhook updates `profiles.subscription_tier` to `pro` or `elite`
6. User redirected to `/dashboard?upgrade=success`

---

## ✅ Step 1: Run the Database Migration

In **Supabase SQL Editor → New Query**, paste and Run:

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub ON public.subscriptions(provider_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));
```

---

## 💳 Step 2: Create a Stripe Account

1. Sign up at **https://dashboard.stripe.com/register**
2. Use your **ZenForge Technologies** business details
3. Go through Stripe's identity verification (~5-10 min)
4. **Start in TEST MODE** (toggle in top-left of dashboard) until you're ready for real charges

---

## 🛍️ Step 3: Create Products in Stripe

### Pro Plan

1. Stripe Dashboard → **Products** → **Add product**
2. Fill in:
   - **Name**: `PathForge Pro`
   - **Description**: `Unlimited career paths, advanced AI mentor, portfolio review, mock interviews`
3. Pricing → **Recurring**
   - **Currency**: `PHP - Philippine Peso`
   - **Amount**: `499.00`
   - **Billing period**: `Monthly`
4. Click **Save product**
5. **Copy the Price ID** (looks like `price_1Q...`). You'll need this in Step 5.

### Elite Plan

1. Add another product:
   - **Name**: `PathForge Elite`
   - **Description**: `Everything in Pro + personalized career strategy, weekly sessions, resume AI, salary coaching`
2. Pricing → **Recurring**
   - **Currency**: `PHP`
   - **Amount**: `1,999.00`
   - **Billing period**: `Monthly`
3. **Copy the Price ID**

You now have **two Price IDs**: `STRIPE_PRICE_PRO` and `STRIPE_PRICE_ELITE`.

---

## 🔑 Step 4: Grab Your Stripe API Keys

1. Stripe Dashboard → **Developers** → **API keys**
2. Copy these two values (use **TEST mode** keys first):
   - **Publishable key**: `pk_test_...` (safe to expose in browser)
   - **Secret key**: `sk_test_...` (NEVER expose; server-only)

---

## ⚙️ Step 5: Add Environment Variables to Vercel

Go to **Vercel Dashboard → Your PathForge project → Settings → Environment Variables**.

Add these (for **all environments**: Production, Preview, Development):

| Name | Value | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (or `sk_live_...` later) | Server-only |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Safe to expose |
| `STRIPE_PRICE_PRO` | `price_1Q...` (from Step 3 Pro) | The Pro price ID |
| `STRIPE_PRICE_ELITE` | `price_1Q...` (from Step 3 Elite) | The Elite price ID |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (set in Step 6) | Webhook signature key |

Click **Save** after each. Then **redeploy** by clicking the most recent deployment → Redeploy.

---

## 🪝 Step 6: Set Up the Webhook

Webhooks let Stripe tell your app when a payment succeeds, fails, or a subscription is cancelled.

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://your-pathforge-domain.vercel.app/api/webhooks/stripe`
   - Replace with your actual deployed URL
3. **Events to send** — select these (or use "Select all events" for safety):
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. After creation, click the endpoint → click **Reveal signing secret**
6. Copy the `whsec_...` value → add it as `STRIPE_WEBHOOK_SECRET` env var in Vercel (Step 5)
7. **Redeploy** Vercel after adding the secret

---

## 🛒 Step 7: Configure the Customer Portal

Lets your users self-manage their subscription (upgrade, downgrade, cancel, update card).

1. Stripe Dashboard → **Settings** → **Billing** → **Customer portal**
2. Toggle ON:
   - ✅ Customers can update payment methods
   - ✅ Customers can cancel subscriptions (recommend at period end)
   - ✅ Customers can switch plans (between Pro and Elite)
   - ✅ Customers can view billing history
3. Set the **Business information** (company name, support email)
4. Set the **Branding** (logo, colors) — optional but recommended
5. Click **Save**

---

## 🧪 Step 8: Test the Full Flow

While in **TEST mode**:

1. Visit `https://your-pathforge-domain.vercel.app/pricing`
2. Sign in (or create test account)
3. Click **Go Pro** → should redirect to Stripe Checkout
4. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry, any CVC, any postal code
5. Complete checkout → should redirect back to `/dashboard?upgrade=success&tier=pro`
6. Check your Supabase `profiles` table → your row should show `subscription_tier = "pro"`
7. Open Settings → **Subscription** section should show "PathForge Pro" + "Manage plan" button
8. Click "Manage plan" → opens Stripe customer portal

If the dashboard doesn't update, check:
- Webhook deliveries in Stripe Dashboard → Webhooks → click endpoint → **Events** tab
- Vercel function logs: Dashboard → your project → Functions → `/api/webhooks/stripe`

---

## 🚀 Step 9: Go Live

When ready to charge real money:

1. Stripe Dashboard → toggle from **Test mode** to **Live mode** (top-left)
2. Get your **Live mode** API keys (Developers → API keys)
3. Create the same Products + Prices in Live mode (steps 3)
4. Create the same Webhook in Live mode (step 6) → get new `whsec_...`
5. Update Vercel env vars with **live** versions:
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_PRICE_PRO` = live mode price ID
   - `STRIPE_PRICE_ELITE` = live mode price ID
   - `STRIPE_WEBHOOK_SECRET` = live mode webhook secret
6. **Redeploy** Vercel
7. Done — you can now accept real payments.

---

## 💰 Payment Methods Supported

Out of the box, Stripe Checkout supports:
- **Credit/debit cards** (Visa, Mastercard, Amex, JCB)
- **Apple Pay / Google Pay** (auto-enabled where supported)
- **Link by Stripe** (one-click checkout for returning customers)

To enable more methods in PH:
1. Stripe Dashboard → **Settings** → **Payment methods**
2. Toggle on additional methods (varies by region — GCash via Stripe is in beta as of 2026)

For full local PH payment support (GCash, Maya, bank transfer), consider integrating **PayMongo** alongside Stripe later.

---

## 📊 What Happens on Each Webhook Event

| Event | What we do |
|---|---|
| `checkout.session.completed` | Immediately upgrade user's tier in `profiles` |
| `customer.subscription.created` | Create row in `subscriptions` table with period end |
| `customer.subscription.updated` | Update existing row, change tier if plan changed |
| `customer.subscription.deleted` | Downgrade user to `free`, mark subscription `cancelled` |
| `invoice.paid` | Log for audit (optional: send receipt email) |
| `invoice.payment_failed` | Log for follow-up (optional: send dunning email) |

---

## ❓ Troubleshooting

### "Payments not configured" error
- Verify `STRIPE_SECRET_KEY` is set in Vercel
- Redeploy after adding env vars

### Webhook signature failed
- Check `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint's secret
- Webhook secrets are different for Test mode vs Live mode

### User tier doesn't update after checkout
- Open Stripe Dashboard → Webhooks → click endpoint → check **Events** tab
- If event is failing, look at the error message
- Check Vercel function logs for `/api/webhooks/stripe`

### "Customer portal not enabled"
- Go to Stripe Dashboard → Settings → Billing → Customer portal → activate it

### Test card declined
- Make sure you're in Test mode (toggle in top-left of Stripe Dashboard)
- Test card `4242 4242 4242 4242` only works in Test mode

---

## 📞 Support

- Stripe support: https://support.stripe.com
- For PH-specific questions: https://stripe.com/en-ph
- Your DPO email for billing privacy queries: privacy@pathforger.app

Last updated: May 2026
