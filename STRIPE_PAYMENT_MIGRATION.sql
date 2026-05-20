-- ============================================================
-- Stripe Payment Integration Migration
-- Adds columns needed for subscription tracking.
-- ============================================================

-- Add Stripe customer ID to profiles for fast lookup
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON public.profiles(stripe_customer_id);

-- Subscriptions table: add provider columns for multi-provider support
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_sub
  ON public.subscriptions(provider_subscription_id);

-- RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can read all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Service role (webhooks) can insert + update via bypass
-- (Webhooks use service role key, RLS-immune)
