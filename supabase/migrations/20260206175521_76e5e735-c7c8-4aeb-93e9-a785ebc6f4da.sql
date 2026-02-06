-- Drop and recreate the function with correct types
DROP FUNCTION IF EXISTS public.get_admin_users_with_email();

CREATE OR REPLACE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  institution text,
  research_field text,
  role public.user_role,
  is_approved boolean,
  created_at timestamptz,
  updated_at timestamptz,
  partner_organization text,
  avatar_url text,
  bio text,
  email varchar(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the requesting user has admin or librarian role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin or librarian role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.phone,
    p.institution,
    p.research_field,
    p.role,
    p.is_approved,
    p.created_at,
    p.updated_at,
    p.partner_organization,
    p.avatar_url,
    p.bio,
    u.email
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.user_id = u.id;
END;
$$;