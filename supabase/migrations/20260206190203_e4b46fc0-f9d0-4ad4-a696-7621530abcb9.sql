-- Mise à jour de la fonction pour retourner tous les rôles d'un utilisateur
DROP FUNCTION IF EXISTS public.get_admin_users_with_email();

CREATE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  institution text,
  role user_role,
  all_roles user_role[],
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
    -- Rôle principal (pour compatibilité)
    COALESCE(
      (SELECT ur.role FROM public.user_roles ur 
       WHERE ur.user_id = u.id 
       AND (ur.expires_at IS NULL OR ur.expires_at > now())
       ORDER BY 
         CASE ur.role
           WHEN 'admin' THEN 1
           WHEN 'librarian' THEN 2
           WHEN 'validateur' THEN 3
           WHEN 'editor' THEN 4
           WHEN 'printer' THEN 5
           WHEN 'producer' THEN 6
           WHEN 'distributor' THEN 7
           WHEN 'author' THEN 8
           WHEN 'partner' THEN 9
           WHEN 'researcher' THEN 10
           WHEN 'subscriber' THEN 11
           ELSE 12
         END
       LIMIT 1),
      (SELECT sr.role_code::user_role 
       FROM public.user_system_roles usr
       JOIN public.system_roles sr ON usr.role_id = sr.id
       WHERE usr.user_id = u.id
       AND sr.role_code IN ('admin', 'librarian', 'editor', 'printer', 'producer', 'distributor', 'author', 'partner', 'researcher', 'subscriber', 'visitor', 'public_user', 'validateur')
       ORDER BY usr.granted_at DESC
       LIMIT 1),
      'visitor'::user_role
    ) as role,
    -- Tous les rôles de l'utilisateur
    COALESCE(
      (SELECT array_agg(DISTINCT ur.role ORDER BY ur.role)
       FROM public.user_roles ur 
       WHERE ur.user_id = u.id 
       AND (ur.expires_at IS NULL OR ur.expires_at > now())),
      ARRAY[]::user_role[]
    ) as all_roles,
    COALESCE(p.is_approved, false) as is_approved,
    COALESCE(p.created_at, u.created_at) as created_at,
    COALESCE(p.updated_at, u.created_at) as updated_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE public.is_admin_or_librarian(auth.uid())
  ORDER BY COALESCE(p.created_at, u.created_at) DESC;
$$;