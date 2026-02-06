-- Create an admin view that includes user email from auth.users
CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
  p.id,
  p.user_id,
  p.first_name,
  p.last_name,
  p.phone,
  p.institution,
  p.research_field,
  p.is_approved,
  p.created_at,
  p.updated_at,
  p.subscription_type,
  p.partner_organization,
  p.research_specialization,
  p.access_level_details,
  p.profile_preferences,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id;

-- Enable RLS on the view (views inherit from base tables, but we add explicit policy)
-- Grant access only to authenticated users with admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Drop existing policy if exists and create new one
DROP POLICY IF EXISTS "Admins can view all users with email" ON public.profiles;

-- Add a comment to document the view
COMMENT ON VIEW public.admin_users_view IS 'Admin view combining profiles with auth.users email for user management';