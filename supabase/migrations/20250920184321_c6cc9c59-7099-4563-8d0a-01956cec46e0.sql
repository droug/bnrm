-- Étape 3: Créer une fonction pour obtenir les permissions selon le profil
CREATE OR REPLACE FUNCTION get_profile_permissions(user_uuid uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role = 'admin' THEN 
        '{"can_manage_users": true, "can_manage_manuscripts": true, "can_approve_requests": true, "max_requests": 999, "access_level": "full"}'::jsonb
      WHEN p.role = 'librarian' THEN 
        '{"can_manage_manuscripts": true, "can_approve_requests": true, "max_requests": 999, "access_level": "extended"}'::jsonb
      WHEN p.role = 'researcher' THEN 
        '{"can_request_manuscripts": true, "max_requests": 50, "access_level": "academic", "can_download": true}'::jsonb
      WHEN p.role = 'partner' THEN 
        '{"can_request_manuscripts": true, "max_requests": 200, "access_level": "institutional", "priority_processing": true}'::jsonb
      WHEN p.role = 'subscriber' THEN 
        '{"can_request_manuscripts": true, "max_requests": 100, "access_level": "premium", "advanced_search": true}'::jsonb
      WHEN p.role = 'public_user' OR p.role = 'visitor' THEN 
        '{"can_view_public": true, "max_requests": 5, "access_level": "basic"}'::jsonb
      ELSE 
        '{"access_level": "none"}'::jsonb
    END as permissions
  FROM profiles p 
  WHERE p.user_id = user_uuid;
$$;