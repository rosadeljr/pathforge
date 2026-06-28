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
