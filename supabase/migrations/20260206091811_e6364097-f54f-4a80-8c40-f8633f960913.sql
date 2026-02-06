-- Recréer la fonction get_user_all_system_roles avec ORDER BY corrigé
CREATE OR REPLACE FUNCTION public.get_user_all_system_roles(_user_id uuid)
RETURNS TABLE(
  role_id TEXT,
  role_code TEXT,
  role_name TEXT,
  role_category TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM (
    -- Admin role from user_roles
    SELECT 
      ur.id::TEXT AS role_id,
      'admin'::TEXT AS role_code,
      'Administrateur'::TEXT AS role_name,
      'administration'::TEXT AS role_category,
      ur.granted_at,
      ur.expires_at
    FROM user_roles ur
    WHERE ur.user_id = _user_id 
    AND ur.role = 'admin'
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    
    UNION ALL
    
    -- Dynamic system roles
    SELECT 
      usr.id::TEXT AS role_id,
      sr.role_code,
      sr.role_name,
      sr.role_category,
      usr.granted_at,
      usr.expires_at
    FROM user_system_roles usr
    INNER JOIN system_roles sr ON sr.id = usr.role_id
    WHERE usr.user_id = _user_id
    AND sr.is_active = true
    AND usr.is_active = true
    AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
  ) AS all_roles
  ORDER BY 
    CASE 
      WHEN all_roles.role_category = 'administration' THEN 1
      WHEN all_roles.role_category = 'professional' THEN 2
      WHEN all_roles.role_category = 'user' THEN 3
      ELSE 4
    END;
END;
$$;