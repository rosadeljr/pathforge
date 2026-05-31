-- ============================================================
-- PathForge — PayMongo automated payments
--
-- Adds first-class fields to payment_requests so we can track
-- automated payments (PayMongo Sources + Payments) alongside
-- the existing manual GCash/Maya proof-upload flow.
--
-- provider = 'manual' for the existing flow (user uploads proof,
--   admin approves) and 'paymongo' for the automated path
--   (webhook flips status when PayMongo says paid).
-- external_id = the PayMongo Source ID first, then the Payment ID
--   once we've created it via webhook (the payment id wins).
-- external_status mirrors PayMongo's latest known status for audit.
--
-- payment_method CHECK is loosened to include 'paymaya' (the proper
-- PayMongo name for the Maya wallet source) and 'card' (PayMongo
-- card payments in a later phase).
--
-- Safe to re-run.
-- ============================================================

-- 1. Loosen the payment_method check to include 'paymaya' and 'card'.
ALTER TABLE public.payment_requests
  DROP CONSTRAINT IF EXISTS payment_requests_payment_method_check;
ALTER TABLE public.payment_requests
  ADD CONSTRAINT payment_requests_payment_method_check
  CHECK (payment_method IN ('gcash', 'maya', 'paymaya', 'card'));

-- 2. Add provider, external_id, external_status.
ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'manual'
    CHECK (provider IN ('manual', 'paymongo'));

ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS external_id TEXT;

ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS external_status TEXT;

-- 3. Index external_id for the webhook lookup (every webhook call
-- needs to find "the payment request that owns this Source id").
CREATE INDEX IF NOT EXISTS idx_payment_requests_external_id
  ON public.payment_requests(external_id)
  WHERE external_id IS NOT NULL;

COMMENT ON COLUMN public.payment_requests.provider IS
  'manual = user uploads proof for admin review. paymongo = auto-approved by webhook.';
COMMENT ON COLUMN public.payment_requests.external_id IS
  'PayMongo Source ID first, replaced by Payment ID after source.chargeable webhook.';
COMMENT ON COLUMN public.payment_requests.external_status IS
  'Latest PayMongo status (pending/chargeable/paid/failed/cancelled). Audit trail.';

-- ============================================================
-- DONE
-- ============================================================
