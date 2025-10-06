-- Fix get_user_permissions function to use user_roles table instead of profiles.role
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH user_primary_role AS (
    SELECT get_user_primary_role(user_uuid) as role
  ),
  user_profile AS (
    SELECT is_approved 
    FROM profiles 
    WHERE user_id = user_uuid
  ),
  role_perms AS (
    SELECT p.name, p.category, rp.granted
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN user_primary_role upr ON rp.role = upr.role
  ),
  user_overrides AS (
    SELECT p.name, p.category, up.granted, up.expires_at
    FROM permissions p
    JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = user_uuid
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ),
  final_permissions AS (
    SELECT 
      COALESCE(uo.name, rp.name) as name,
      COALESCE(uo.category, rp.category) as category,
      COALESCE(uo.granted, rp.granted) as granted,
      uo.expires_at
    FROM role_perms rp
    FULL OUTER JOIN user_overrides uo ON rp.name = uo.name
  )
  SELECT jsonb_object_agg(
    name, 
    jsonb_build_object(
      'granted', granted AND COALESCE((SELECT is_approved FROM user_profile), false),
      'category', category,
      'expires_at', expires_at
    )
  )
  FROM final_permissions
  WHERE granted = true;
$$;