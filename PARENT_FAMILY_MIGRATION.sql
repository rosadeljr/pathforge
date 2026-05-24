-- ============================================================
-- PathForge — Parent Dashboard & Family Plan support
-- Safe to re-run.
-- ============================================================

-- parent_email already exists from LEARNER_MODE_MIGRATION (allowed to be null).
-- Add an explicit "is_parent_account" flag so the same Supabase auth can host
-- a parent who isn't themselves a learner.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_parent_account BOOLEAN NOT NULL DEFAULT FALSE;

-- Multi-kid support (Family plan). A learner can be linked to a parent's
-- profile.id. The link is one-way: kids reference their parent.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_profile_id UUID
    REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_parent_id
  ON public.profiles(parent_profile_id)
  WHERE parent_profile_id IS NOT NULL;

-- RLS policy: a parent can SELECT their linked kids' profiles.
DROP POLICY IF EXISTS "Parents can view linked kids" ON public.profiles;
CREATE POLICY "Parents can view linked kids"
  ON public.profiles FOR SELECT
  USING (parent_profile_id = auth.uid());

-- Parents can also view their linked kids' analytics events (for the dashboard)
DROP POLICY IF EXISTS "Parents can view linked kids events" ON public.analytics_events;
CREATE POLICY "Parents can view linked kids events"
  ON public.analytics_events FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE parent_profile_id = auth.uid()
    )
  );

-- Comments
COMMENT ON COLUMN public.profiles.is_parent_account IS
  'True if this profile is a parent (not a learner). Parents see /parent dashboard instead of /learn.';
COMMENT ON COLUMN public.profiles.parent_profile_id IS
  'For learners under a Family plan: the parent profile.id they are linked to. Allows parent dashboard to query progress.';

-- ============================================================
-- DONE
-- ============================================================
