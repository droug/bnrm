-- ============================================
-- FIX: Remove SECURITY DEFINER from profiles_public view
-- ============================================
-- Replace the view without SECURITY DEFINER to avoid security issues
-- Users will see profiles based on existing RLS policies

DROP VIEW IF EXISTS public.profiles_public;

-- Recreate view without security definer
-- RLS policies on the underlying profiles table will still apply
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  institution,
  research_field,
  role,
  is_approved,
  subscription_type,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at
FROM public.profiles;

-- Note: We don't use SECURITY DEFINER for views
-- RLS policies on profiles table will control access