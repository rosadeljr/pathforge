-- ============================================================
-- PathForge — Streak system foundation + Streak Freeze
--
-- The streak_count and longest_streak columns already exist on
-- profiles, but no code currently increments them — UI everywhere
-- shows 0d. This migration only adds the freeze fields; the actual
-- streak math is now applied client-side in the lesson completion
-- flow (lib/streak.ts).
--
-- streak_freezes_remaining: stockpile of "missed-day shields" (cap 2).
--   Granted +1 every Sunday by the weekly cron when the kid has an
--   active streak. Consumed automatically when the kid returns after
--   missing exactly one day (more than that = streak resets).
--
-- streak_frozen_at: timestamp of the most recent freeze use, used
--   by the UI to show a "❄️ streak protected" badge for ~24h.
--
-- Safe to re-run.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_freezes_remaining INTEGER NOT NULL DEFAULT 0
    CHECK (streak_freezes_remaining BETWEEN 0 AND 5);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS streak_frozen_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.profiles.streak_freezes_remaining IS
  'Streak freeze stockpile (0-5). +1 granted weekly by the cron when streak_count > 0. Auto-consumed when the kid returns after missing one day.';
COMMENT ON COLUMN public.profiles.streak_frozen_at IS
  'Timestamp of the most recent freeze use. UI shows "streak protected" badge for ~24h after.';

-- ============================================================
-- DONE
-- ============================================================
