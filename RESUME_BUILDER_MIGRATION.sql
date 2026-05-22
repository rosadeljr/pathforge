-- ============================================================
-- PathForge Resume Builder
-- Run ONCE in the Supabase SQL Editor. Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own resume" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert own resume" ON public.resumes;
DROP POLICY IF EXISTS "Users can update own resume" ON public.resumes;

CREATE POLICY "Users can read own resume"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- DONE — the PathForge Resume Builder can now save resumes.
-- ============================================================
