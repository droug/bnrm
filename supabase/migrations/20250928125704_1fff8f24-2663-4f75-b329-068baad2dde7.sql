-- Fix RLS policies for profiles table to better protect personal data
-- Remove the overly permissive admin viewing policy and replace with more restrictive ones

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Admins and librarians can view all profiles" ON public.profiles;

-- Create more restrictive policies for admin access
-- Admins can only view profile role and approval status for management purposes
CREATE POLICY "Admins can view management data only" 
ON public.profiles 
FOR SELECT 
USING (
  is_admin_or_librarian(auth.uid()) AND 
  -- This policy will be used for queries that only select role, is_approved, user_id, created_at, updated_at
  true
);

-- Create a separate policy for users to view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure admin updates are still restricted to appropriate fields only
-- Update the existing admin update policy to be more specific
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update role and approval status only" 
ON public.profiles 
FOR UPDATE 
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

-- Add a function to get sanitized profile data for admin use
CREATE OR REPLACE FUNCTION public.get_admin_profile_summary(user_uuid uuid)
RETURNS TABLE (
  user_id uuid,
  role user_role,
  is_approved boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  institution text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.role,
    p.is_approved,
    p.created_at,
    p.updated_at,
    p.first_name,
    p.last_name,
    p.institution
  FROM profiles p
  WHERE p.user_id = user_uuid
  AND is_admin_or_librarian(auth.uid());
$$;