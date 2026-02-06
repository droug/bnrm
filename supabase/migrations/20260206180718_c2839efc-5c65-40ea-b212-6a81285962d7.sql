-- Must drop existing function because return type changed
DROP FUNCTION IF EXISTS public.get_admin_users_with_email();

-- Recreate with correct return type matching profiles table structure
CREATE OR REPLACE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE(
  avatar_url text,
  bio text,
  created_at timestamptz,
  email text,
  first_name text,
  id uuid,
  institution text,
  is_approved boolean,
  last_name text,
  partner_organization text,
  phone text,
  research_field text,
  role public.user_role,
  updated_at timestamptz,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Require admin or librarian role to access full user list with emails
  IF NOT (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'librarian')
        AND (ur.expires_at IS NULL OR ur.expires_at > now())
    )
    OR EXISTS (
      SELECT 1
      FROM public.user_system_roles usr
      JOIN public.system_roles sr ON sr.id = usr.role_id
      WHERE usr.user_id = auth.uid()
        AND COALESCE(usr.is_active, true) = true
        AND (usr.expires_at IS NULL OR usr.expires_at > now())
        AND sr.role_code IN ('admin', 'librarian')
    )
  ) THEN
    RAISE EXCEPTION 'Access denied: admin or librarian required';
  END IF;

  RETURN QUERY
  SELECT
    ''::text AS avatar_url,
    ''::text AS bio,
    p.created_at,
    COALESCE(u.email, '')::text AS email,
    p.first_name,
    p.id,
    COALESCE(p.institution, '') AS institution,
    COALESCE(p.is_approved, false) AS is_approved,
    p.last_name,
    COALESCE(p.partner_organization, '') AS partner_organization,
    COALESCE(p.phone, '') AS phone,
    COALESCE(p.research_field, '') AS research_field,
    COALESCE(
      (
        SELECT ur.role
        FROM public.user_roles ur
        WHERE ur.user_id = p.user_id
          AND (ur.expires_at IS NULL OR ur.expires_at > now())
        ORDER BY
          CASE ur.role
            WHEN 'admin' THEN 1
            WHEN 'librarian' THEN 2
            WHEN 'partner' THEN 3
            WHEN 'researcher' THEN 4
            WHEN 'subscriber' THEN 5
            WHEN 'public_user' THEN 6
            WHEN 'visitor' THEN 7
            ELSE 999
          END,
          ur.granted_at DESC NULLS LAST
        LIMIT 1
      ),
      'visitor'::public.user_role
    ) AS role,
    p.updated_at,
    p.user_id
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.updated_at DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_users_with_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_users_with_email() TO authenticated;