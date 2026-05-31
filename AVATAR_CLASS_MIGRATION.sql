-- ============================================================
-- PathForge — Avatar starter class
-- A simple, kid-safe identity hook: pick a "class" at setup
-- (Scholar / Explorer / Inventor). Cosmetic only — no gameplay
-- advantage, no microtransaction, no random rolls. Foundation
-- for future unlockable cosmetics tied to lesson/quest progress.
-- Safe to re-run.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learner_avatar_class TEXT
    CHECK (learner_avatar_class IN ('scholar', 'explorer', 'inventor', 'guardian', 'storyteller'));

COMMENT ON COLUMN public.profiles.learner_avatar_class IS
  'Cosmetic class chosen by the learner at setup. NULL until picked. No gameplay advantage.';

-- ============================================================
-- DONE
-- ============================================================
