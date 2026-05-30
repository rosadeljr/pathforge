-- ============================================================
-- PathForge — Privacy controls for kids
-- - leaderboard opt-out (off by default = SHOWN — explicit opt-out
--   prevents accidental hiding of the engagement loop).
-- - display_name preference: real username vs pseudonymous tier label.
-- Safe to re-run.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_mode TEXT NOT NULL DEFAULT 'username'
    CHECK (display_mode IN ('username', 'pseudonymous'));

COMMENT ON COLUMN public.profiles.show_on_leaderboard IS
  'When FALSE the learner is excluded from leaderboard queries. Parent-controlled.';
COMMENT ON COLUMN public.profiles.display_mode IS
  'username = show kid''s username; pseudonymous = show "Junior Forger · Lv N" instead.';

-- ============================================================
-- DONE
-- ============================================================
