-- D'abord supprimer la fonction existante
DROP FUNCTION IF EXISTS public.get_admin_users_with_email();

-- Puis la recréer avec LEFT JOIN depuis auth.users et rôle depuis user_roles
CREATE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  institution text,
  role user_role,
  is_approved boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.id, u.id) as id,
    u.id as user_id,
    u.email,
    COALESCE(p.first_name, '') as first_name,
    COALESCE(p.last_name, '') as last_name,
    COALESCE(p.institution, '') as institution,
    COALESCE(
      (SELECT ur.role FROM public.user_roles ur 
       WHERE ur.user_id = u.id 
       AND (ur.expires_at IS NULL OR ur.expires_at > now())
       ORDER BY 
         CASE ur.role
           WHEN 'admin' THEN 1
           WHEN 'librarian' THEN 2
           WHEN 'partner' THEN 3
           WHEN 'researcher' THEN 4
           WHEN 'subscriber' THEN 5
           ELSE 6
         END
       LIMIT 1),
      'visitor'::user_role
    ) as role,
    COALESCE(p.is_approved, false) as is_approved,
    COALESCE(p.created_at, u.created_at) as created_at,
    COALESCE(p.updated_at, u.created_at) as updated_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.is_admin_or_librarian(auth.uid())
  ORDER BY COALESCE(p.created_at, u.created_at) DESC;
$$;