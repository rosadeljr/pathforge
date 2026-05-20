-- ============================================================
-- PathForge Admin + Analytics Migration
-- Adds: admin role flag, analytics indexes, admin RLS policies
-- ============================================================

-- Admin flag on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Indexes on analytics_events for fast aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON public.analytics_events(user_id, created_at DESC);

-- Index for time-based profile aggregations
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- ============================================================
-- RLS for admins
-- ============================================================

-- Helper function to check if a user is admin (used in policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = user_id),
    FALSE
  );
$$;

-- Admins can read ALL profiles (not just their own)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can update any profile (to grant Pro/Elite, ban, etc.)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Admins can read all analytics events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own analytics events" ON public.analytics_events;
CREATE POLICY "Users can read own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all analytics events" ON public.analytics_events;
CREATE POLICY "Admins can read all analytics events"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can read all quests (for user detail page)
DROP POLICY IF EXISTS "Admins can read all quests" ON public.quests;
CREATE POLICY "Admins can read all quests"
  ON public.quests FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Admins can read all projects
DROP POLICY IF EXISTS "Admins can read all projects" ON public.projects;
CREATE POLICY "Admins can read all projects"
  ON public.projects FOR SELECT
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- Helper view: admin stats overview
-- Aggregates key metrics for the admin dashboard
-- ============================================================

CREATE OR REPLACE VIEW public.admin_overview AS
SELECT
  -- Acquisition
  (SELECT COUNT(*) FROM public.profiles) AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '24 hours') AS signups_today,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '7 days') AS signups_week,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at >= NOW() - INTERVAL '30 days') AS signups_month,

  -- Activation
  (SELECT COUNT(*) FROM public.profiles WHERE selected_career_path_id IS NOT NULL) AS users_onboarded,
  (SELECT COUNT(DISTINCT user_id) FROM public.quests WHERE status = 'completed') AS users_completed_quest,

  -- Engagement
  (SELECT COUNT(*) FROM public.quests WHERE status = 'completed') AS total_quests_completed,
  (SELECT COUNT(*) FROM public.projects) AS total_projects,
  (SELECT COUNT(DISTINCT user_id) FROM public.profiles WHERE last_quest_completed_at >= NOW() - INTERVAL '24 hours') AS dau,
  (SELECT COUNT(DISTINCT user_id) FROM public.profiles WHERE last_quest_completed_at >= NOW() - INTERVAL '7 days') AS wau,
  (SELECT COUNT(DISTINCT user_id) FROM public.profiles WHERE last_quest_completed_at >= NOW() - INTERVAL '30 days') AS mau,

  -- Monetization
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'pro') AS pro_users,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'elite') AS elite_users,
  (SELECT COUNT(*) FROM public.profiles WHERE subscription_tier = 'free' OR subscription_tier IS NULL) AS free_users;

GRANT SELECT ON public.admin_overview TO authenticated;

-- ============================================================
-- IMPORTANT: After running this migration, make yourself an admin.
-- Replace YOUR_EMAIL with your actual email.
-- ============================================================
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'YOUR_EMAIL_HERE';
