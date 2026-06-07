-- =============================================================================
-- RPG_PROGRESSION_MIGRATION.sql
-- Adds optional, backward-compatible persistence for the PathForge educational
-- RPG layer. The app FUNCTIONS WITHOUT THIS migration (class is derived from
-- learner_avatar_class, class XP from subject XP, skills from class level,
-- rewards/quests from analytics_events). Running this enables: explicit class
-- selection across the 10 RPG classes, a dedicated class-XP counter, and
-- durable skill/quest/reward/arena records.
--
-- Safe to run multiple times (IF NOT EXISTS guards). No existing data changes.
-- =============================================================================

-- ---------- profiles: RPG progression columns -------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS learner_selected_class TEXT,
  ADD COLUMN IF NOT EXISTS rpg_class_xp        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rpg_unlocked_skills TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rpg_completed_quests TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS rpg_earned_rewards  TEXT[]  NOT NULL DEFAULT '{}',
  -- hero cosmetics from the Avatar Creator (skin/hair/outfit/headgear/gear/title)
  ADD COLUMN IF NOT EXISTS rpg_avatar          JSONB   NOT NULL DEFAULT '{}'::jsonb;

-- NOTE: quest starts, arena completions, and reward claims are logged to the
-- existing analytics_events table (event_type rpg_quest_started /
-- rpg_arena_completed / rpg_reward_claimed) and derived back in lib/rpg/state.ts
-- — no extra tables needed for those.

-- Constrain selected class to the known RPG classes (nullable = not chosen yet).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_learner_selected_class_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_learner_selected_class_check
      CHECK (
        learner_selected_class IS NULL OR learner_selected_class IN (
          'scholar','builder','healer','storyteller','explorer',
          'guardian','merchant','tech-tinkerer','creator','navigator'
        )
      );
  END IF;
END $$;

-- ---------- arena_results: kid-safe duel history -----------------------------
CREATE TABLE IF NOT EXISTS public.arena_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode_id     TEXT NOT NULL,
  correct     INTEGER NOT NULL DEFAULT 0,
  total       INTEGER NOT NULL DEFAULT 0,
  accuracy    NUMERIC(4,3) NOT NULL DEFAULT 0,
  outcome     TEXT NOT NULL DEFAULT 'close' CHECK (outcome IN ('win','tie','close')),
  xp_earned   INTEGER NOT NULL DEFAULT 0,
  -- anonymous ghost codename only; never another child's real identity
  opponent_codename TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS arena_results_user_id_idx ON public.arena_results(user_id);

ALTER TABLE public.arena_results ENABLE ROW LEVEL SECURITY;

-- A learner can only read and write their OWN arena results.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'arena_results_select_own') THEN
    CREATE POLICY arena_results_select_own ON public.arena_results
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'arena_results_insert_own') THEN
    CREATE POLICY arena_results_insert_own ON public.arena_results
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================================================
-- NOTE: character level reuses the existing profiles.current_level / total_xp.
-- No separate character_level column is added to avoid duplicating the source
-- of truth; the RPG UI derives character level from total_xp.
-- =============================================================================
