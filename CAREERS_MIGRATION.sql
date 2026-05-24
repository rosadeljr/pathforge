-- ============================================================
-- PathForge — Career exploration for kids
-- Adds dream_career_id to profiles so learners can pick a goal.
-- Safe to re-run.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dream_career_id TEXT;

-- Optional helpful comment for psql introspection
COMMENT ON COLUMN public.profiles.dream_career_id IS
  'The learner-picked career goal id (matches CAREERS data ids in lib/data/careers.ts). Used to personalize lessons and tutor responses.';

-- ============================================================
-- DONE
-- ============================================================
