-- ============================================================
-- Public Profile Support
-- Allows /u/[username] pages to read public profile data.
-- ============================================================

-- Allow anyone (anon role) to read public-safe profile columns
-- We keep email out of public access; other columns are safe.
-- The existing "Users can read own profile" already allows full access for auth.uid()=id.
-- Add a separate policy for public discovery.

DROP POLICY IF EXISTS "Public can read profiles by username" ON public.profiles;
CREATE POLICY "Public can read profiles by username"
  ON public.profiles FOR SELECT
  USING (username IS NOT NULL);

-- Allow public read of projects (for portfolio sharing)
DROP POLICY IF EXISTS "Public can read projects" ON public.projects;
CREATE POLICY "Public can read projects"
  ON public.projects FOR SELECT
  USING (true);

-- Allow public read of user_achievements (which trophies someone has)
DROP POLICY IF EXISTS "Public can read user_achievements" ON public.user_achievements;
CREATE POLICY "Public can read user_achievements"
  ON public.user_achievements FOR SELECT
  USING (true);

-- Achievements table is already public via "Achievements are public" policy
-- (created in initial schema)
