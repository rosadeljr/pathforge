-- ============================================================
-- PathForge Launch-Ready Migration
-- Adds fields for career path change tracking + streak system
-- Safe to run multiple times
-- ============================================================

-- Career path change tracking (max 3 changes)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS career_path_changes_count INTEGER DEFAULT 0;

-- Last quest completion date (for streak calculation)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_quest_completed_at TIMESTAMP WITH TIME ZONE;

-- Index for faster achievement lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user
  ON public.user_achievements(user_id);

-- Seed achievements (idempotent via ON CONFLICT)
INSERT INTO public.achievements (id, title, description, achievement_type, rarity, xp_bonus, icon_name) VALUES
  ('10000000-0000-0000-0000-000000000001', 'First Step', 'Complete your first quest', 'milestone', 'common', 50, 'rocket'),
  ('10000000-0000-0000-0000-000000000002', '7-Day Streak', 'Maintain a 7-day streak', 'streak', 'rare', 200, 'flame'),
  ('10000000-0000-0000-0000-000000000003', '30-Day Streak', 'Maintain a 30-day streak', 'streak', 'epic', 1000, 'flame'),
  ('10000000-0000-0000-0000-000000000004', 'Portfolio Builder', 'Add your first project', 'portfolio', 'rare', 100, 'briefcase'),
  ('10000000-0000-0000-0000-000000000005', 'Level 10', 'Reach level 10', 'milestone', 'epic', 500, 'star'),
  ('10000000-0000-0000-0000-000000000006', 'Level 25', 'Reach level 25', 'milestone', 'epic', 1500, 'star'),
  ('10000000-0000-0000-0000-000000000007', 'Level 50', 'Reach level 50', 'milestone', 'legendary', 5000, 'star'),
  ('10000000-0000-0000-0000-000000000008', 'Quest Slayer', 'Complete 25 quests', 'milestone', 'rare', 500, 'sword'),
  ('10000000-0000-0000-0000-000000000009', 'Quest Master', 'Complete 100 quests', 'milestone', 'legendary', 2500, 'crown'),
  ('10000000-0000-0000-0000-000000000010', 'Boss Slayer', 'Complete an Insane-difficulty quest', 'milestone', 'epic', 1000, 'crown')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp_bonus = EXCLUDED.xp_bonus,
  rarity = EXCLUDED.rarity;

-- RLS policy for user_achievements (allow users to read/insert their own)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

CREATE POLICY "Users can read own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policy for projects (insert)
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policy for quests (insert + update)
DROP POLICY IF EXISTS "Users can insert own quests" ON public.quests;
CREATE POLICY "Users can insert own quests"
  ON public.quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quests" ON public.quests;
CREATE POLICY "Users can update own quests"
  ON public.quests FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Done!
-- ============================================================
