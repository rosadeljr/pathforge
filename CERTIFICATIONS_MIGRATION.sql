-- ============================================================
-- PathForge AI Academy — Certifications
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  career_path_id UUID NOT NULL,
  career_path_title TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  final_level INTEGER DEFAULT 1,
  quests_completed INTEGER DEFAULT 0,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- One certificate per career path per user.
  UNIQUE (user_id, career_path_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_credential ON public.certificates(credential_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Certificates are publicly verifiable" ON public.certificates;
DROP POLICY IF EXISTS "Users can issue own certificates" ON public.certificates;

-- Anyone can verify a certificate (the public /verify/[code] page needs this).
CREATE POLICY "Certificates are publicly verifiable"
  ON public.certificates FOR SELECT
  USING (TRUE);

-- A user can only issue a certificate for themselves.
CREATE POLICY "Users can issue own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- DONE — PathForge AI Academy certificates are live.
-- ============================================================
