-- ============================================================
-- PathForge — RUN THIS ONCE in Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste all → Run)
-- Adds the columns/functions the deployed app expects but your
-- database is missing. Every statement is idempotent / safe to re-run.
-- ============================================================

-- ---- 1) Avatar class column (fixes the onboarding 'Start learning' error)
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

-- ---- 2) Parent / family columns + access policies
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

-- ---- 3) Secure parent<->kid linking functions
-- ============================================================
-- PathForge — Secure parent <-> kid linking (RPC)
-- Safe to re-run.
--
-- WHY: profiles RLS only lets a user read/update their OWN row
-- (auth.uid() = id). That makes the family-link flow impossible from the
-- client:
--   * a parent can't UPDATE a kid's row to claim them, and
--   * a kid can't SELECT a parent's row to resolve their id by email.
-- So linking silently affected 0 rows and parent dashboards were always empty.
--
-- FIX: two SECURITY DEFINER functions that bypass RLS but enforce
-- authorization internally via auth.uid(). Granted to `authenticated` only.
-- ============================================================

-- Parent claims any not-yet-linked kids who typed this parent's email during
-- their own setup. Matches on the CALLER's verified email, only claims kids
-- that are currently unclaimed, and never touches the caller's own row's link.
-- Returns the number of kids newly linked. Idempotent.
CREATE OR REPLACE FUNCTION public.parent_claim_kids()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_email text;
  v_count integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(email) INTO v_email FROM public.profiles WHERE id = v_uid;
  IF v_email IS NULL OR v_email = '' THEN
    RETURN 0;
  END IF;

  -- Make sure the caller is flagged as a parent account (idempotent).
  UPDATE public.profiles SET is_parent_account = true
  WHERE id = v_uid AND is_parent_account IS DISTINCT FROM true;

  WITH linked AS (
    UPDATE public.profiles
    SET parent_profile_id = v_uid
    WHERE lower(parent_email) = v_email
      AND parent_profile_id IS NULL
      AND id <> v_uid
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM linked;

  RETURN v_count;
END;
$$;

-- Learner links THEMSELVES to a parent account by the parent's email.
-- Always records parent_email on the learner's own row (so a parent who signs
-- up later can claim them), and sets parent_profile_id when a matching parent
-- account already exists. Returns true if a live parent account was linked.
CREATE OR REPLACE FUNCTION public.learner_link_parent(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid    uuid := auth.uid();
  v_parent uuid;
  v_clean  text := lower(trim(coalesce(p_email, '')));
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF v_clean = '' OR position('@' in v_clean) = 0 THEN
    RETURN false;
  END IF;

  SELECT id INTO v_parent
  FROM public.profiles
  WHERE lower(email) = v_clean
    AND is_parent_account = true
    AND id <> v_uid
  LIMIT 1;

  UPDATE public.profiles
  SET parent_email      = v_clean,
      parent_profile_id = COALESCE(v_parent, parent_profile_id)
  WHERE id = v_uid;

  RETURN v_parent IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.parent_claim_kids() FROM public, anon;
REVOKE ALL ON FUNCTION public.learner_link_parent(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.parent_claim_kids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.learner_link_parent(text) TO authenticated;

-- ============================================================
-- DONE — run this in the Supabase SQL editor (or via db:migrate).
-- ============================================================
