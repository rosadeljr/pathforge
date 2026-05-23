-- ============================================================
-- PathForge — Friendships (Phase 5a)
-- Lets users connect with friends (within the same user_mode).
-- Safe to re-run.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (requester_id, recipient_id),
  CHECK (requester_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_recipient ON public.friendships(recipient_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);

-- ============================================================
-- SAFETY: friendships must stay within the same user_mode so a kid
-- can't friend an adult forger and vice versa. Enforced at the DB.
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_same_mode_friendship()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_mode TEXT;
  recipient_mode TEXT;
BEGIN
  SELECT user_mode INTO requester_mode FROM public.profiles WHERE id = NEW.requester_id;
  SELECT user_mode INTO recipient_mode FROM public.profiles WHERE id = NEW.recipient_id;
  IF requester_mode IS DISTINCT FROM recipient_mode THEN
    RAISE EXCEPTION 'Friend requests are only allowed within the same mode (career or learner)';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_friendship_same_mode ON public.friendships;
CREATE TRIGGER trg_friendship_same_mode
  BEFORE INSERT ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.enforce_same_mode_friendship();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read friendships I'm part of" ON public.friendships;
DROP POLICY IF EXISTS "Send a friend request" ON public.friendships;
DROP POLICY IF EXISTS "Update friendships I'm part of" ON public.friendships;
DROP POLICY IF EXISTS "Delete friendships I'm part of" ON public.friendships;

CREATE POLICY "Read friendships I'm part of"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Send a friend request"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Update friendships I'm part of"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Delete friendships I'm part of"
  ON public.friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- ============================================================
-- DONE — friendships table is ready.
-- ============================================================
