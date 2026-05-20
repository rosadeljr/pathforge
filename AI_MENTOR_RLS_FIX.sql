-- Fix: Add RLS policies for ai_messages table
-- This was missing from the initial schema — RLS was enabled but no policies
-- existed, so all reads/writes silently failed.

DROP POLICY IF EXISTS "Users can read own messages" ON public.ai_messages;
CREATE POLICY "Users can read own messages"
  ON public.ai_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own messages" ON public.ai_messages;
CREATE POLICY "Users can insert own messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all messages (for moderation / support)
DROP POLICY IF EXISTS "Admins can read all messages" ON public.ai_messages;
CREATE POLICY "Admins can read all messages"
  ON public.ai_messages FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Index for faster history lookups
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_created
  ON public.ai_messages(user_id, created_at);
