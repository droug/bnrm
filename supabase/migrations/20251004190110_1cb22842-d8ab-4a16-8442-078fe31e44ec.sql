-- Fix Security Definer Views by recreating them with SECURITY INVOKER enabled
-- This ensures RLS policies are respected based on the querying user's permissions

-- Drop existing views
DROP VIEW IF EXISTS public.manuscript_reading_stats CASCADE;
DROP VIEW IF EXISTS public.profiles_public CASCADE;

-- Recreate manuscript_reading_stats WITH SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the creator
CREATE VIEW public.manuscript_reading_stats
WITH (security_invoker=on)
AS
SELECT 
  user_id,
  manuscript_id,
  MAX(created_at) AS last_read_at,
  COUNT(*) FILTER (WHERE action_type = 'read') AS read_count,
  COUNT(*) FILTER (WHERE action_type = 'download') AS download_count,
  MAX(page_number) AS last_page
FROM public.manuscript_reading_history
GROUP BY user_id, manuscript_id;

-- Recreate profiles_public WITH SECURITY INVOKER
-- This ensures the view uses the permissions of the querying user, not the creator
CREATE VIEW public.profiles_public
WITH (security_invoker=on)
AS
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

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.manuscript_reading_stats TO authenticated;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Security is now enforced through:
-- 1. RLS policies on the underlying tables (manuscript_reading_history and profiles)
-- 2. SECURITY INVOKER mode ensuring queries run with the calling user's permissions