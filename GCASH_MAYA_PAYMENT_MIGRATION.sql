-- ============================================================
-- GCash / Maya Manual Payment Flow Migration
--
-- Users submit a proof of payment after sending money via GCash or Maya.
-- Admins review submissions in /admin/payments and approve.
-- Approval auto-upgrades the user's subscription_tier.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'elite')),
  amount_php INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'maya')),
  sender_name TEXT,
  sender_number TEXT,
  reference_number TEXT,
  proof_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own payment requests" ON public.payment_requests;
CREATE POLICY "Users can read own payment requests"
  ON public.payment_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payment requests" ON public.payment_requests;
CREATE POLICY "Users can insert own payment requests"
  ON public.payment_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all payment requests" ON public.payment_requests;
CREATE POLICY "Admins can read all payment requests"
  ON public.payment_requests FOR SELECT
  USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update payment requests" ON public.payment_requests;
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE
  USING (public.is_admin(auth.uid()));
