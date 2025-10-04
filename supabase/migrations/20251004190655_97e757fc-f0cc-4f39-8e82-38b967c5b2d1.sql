-- Fix critical security vulnerability in chatbot_interactions table
-- Problem: Current policy allows unauthenticated users to view all interactions
-- Solution: Restrict SELECT to only authenticated users viewing their own data

-- Drop the insecure policies
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.chatbot_interactions;
DROP POLICY IF EXISTS "Users can create their own interactions" ON public.chatbot_interactions;

-- Create secure SELECT policy - users can ONLY view their own interactions
-- Admins can view all (already covered by existing "Admins can view all interactions" policy)
CREATE POLICY "Users can view their own interactions"
ON public.chatbot_interactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create secure INSERT policy - only authenticated users can create interactions
-- Remove the dangerous (auth.uid() IS NULL) condition that allowed unauthenticated access
CREATE POLICY "Authenticated users can create their own interactions"
ON public.chatbot_interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Note: The existing "Admins can view all interactions" policy remains unchanged
-- and allows admins to view all interactions for support purposes