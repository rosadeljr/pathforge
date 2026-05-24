-- ============================================================
-- PathForge — Career Mastery Certificates
-- Awarded when a learner reaches the final stage of any career's
-- 5-stage adventure (total_xp >= max(xpToUnlock, 1500)).
-- Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.career_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  career_id TEXT NOT NULL,
  -- short shareable code, e.g. "PF-AI-X7Y9Z2"
  credential_code TEXT NOT NULL UNIQUE,
  -- snapshot at award time so the certificate stays correct even if the
  -- learner changes their username later
  recipient_name TEXT NOT NULL,
  career_title TEXT NOT NULL,
  total_xp_at_award INTEGER NOT NULL DEFAULT 0,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- one certificate per (learner, career)
  UNIQUE (user_id, career_id)
);

CREATE INDEX IF NOT EXISTS idx_career_certificates_user
  ON public.career_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_career_certificates_code
  ON public.career_certificates(credential_code);

-- RLS
ALTER TABLE public.career_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own certificates readable" ON public.career_certificates;
DROP POLICY IF EXISTS "Public verify by code" ON public.career_certificates;
DROP POLICY IF EXISTS "Self insert certificates" ON public.career_certificates;
DROP POLICY IF EXISTS "Parents see kids certs" ON public.career_certificates;

-- Kid can read their own certificates
CREATE POLICY "Own certificates readable"
  ON public.career_certificates FOR SELECT
  USING (user_id = auth.uid());

-- Kid awards their own certificate (write only their own)
CREATE POLICY "Self insert certificates"
  ON public.career_certificates FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Parents see their linked kids' certificates
CREATE POLICY "Parents see kids certs"
  ON public.career_certificates FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE parent_profile_id = auth.uid()
    )
  );

COMMENT ON TABLE public.career_certificates IS
  'Career mastery certificates. Auto-awarded when a learner reaches the final stage of a career adventure.';

-- ============================================================
-- DONE
-- ============================================================
