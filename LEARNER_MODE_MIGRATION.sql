-- ============================================================
-- PathForge — Learner mode (soft-pivot for kids' edu)
-- Adds the mode flag + learner-specific fields to profiles.
-- Safe to re-run.
-- ============================================================

-- Mode: 'career' (existing PathForge) or 'learner' (kids edu).
-- NULL means the user hasn't picked yet — the app shows them the picker.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_mode TEXT
    CHECK (user_mode IS NULL OR user_mode IN ('career', 'learner'));

-- Existing users keep their career experience — don't disrupt them.
UPDATE public.profiles
  SET user_mode = 'career'
  WHERE user_mode IS NULL
    AND (selected_career_path_id IS NOT NULL OR total_xp > 0);

-- Grade level for learner mode (1-10 covers PH Elementary + Junior High).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learner_grade INTEGER;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_learner_grade_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_learner_grade_check
    CHECK (learner_grade IS NULL OR (learner_grade BETWEEN 1 AND 10));

-- Selected subjects (e.g. ['math', 'english', 'filipino']).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learner_subjects TEXT[] DEFAULT '{}';

-- Parent contact for under-13s (Data Privacy Act + child safeguards).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS parent_email TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_user_mode
  ON public.profiles(user_mode);

-- ============================================================
-- DONE — your existing PathForge users keep their career flow.
-- New signups will see a "Who's this for?" screen at /welcome.
-- ============================================================
