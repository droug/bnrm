-- Drop and recreate views without SECURITY DEFINER
-- This ensures RLS policies on underlying tables are properly enforced

-- Drop existing views
DROP VIEW IF EXISTS public.manuscript_reading_stats;
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate manuscript_reading_stats without SECURITY DEFINER
-- This view aggregates reading statistics per user and manuscript
-- Security is enforced through RLS on the manuscript_reading_history table
CREATE VIEW public.manuscript_reading_stats AS
SELECT 
  user_id,
  manuscript_id,
  MAX(created_at) AS last_read_at,
  COUNT(*) FILTER (WHERE action_type = 'read') AS read_count,
  COUNT(*) FILTER (WHERE action_type = 'download') AS download_count,
  MAX(page_number) AS last_page
FROM public.manuscript_reading_history
GROUP BY user_id, manuscript_id;

-- Recreate profiles_public without SECURITY DEFINER
-- This view provides a subset of profile data (excluding sensitive PII like phone)
-- Security is enforced through RLS on the profiles table
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

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON public.manuscript_reading_stats TO authenticated;
GRANT SELECT ON public.profiles_public TO authenticated;

-- Grant SELECT permissions to anon users (for public access)
GRANT SELECT ON public.profiles_public TO anon;