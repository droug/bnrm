-- Fix RLS policy for conversations INSERT
-- The issue is that the current policy checks auth.uid() IS NOT NULL in with_check
-- but doesn't ensure the user is actually added as a participant

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());