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

-- Ajouter des exemples de profils différenciés avec les nouveaux rôles
UPDATE profiles SET role = 'public_user' WHERE role = 'visitor' AND first_name = 'Ahmed';
UPDATE profiles SET role = 'partner', partner_organization = 'Institut du Maroc' WHERE first_name = 'Ahmed' AND last_name = 'Benali';

-- Ajouter des profils fictifs avec les nouveaux rôles (utilisant l'utilisateur admin existant comme base)
INSERT INTO profiles (user_id, first_name, last_name, institution, research_field, phone, role, is_approved, subscription_type, partner_organization) 
SELECT 
  gen_random_uuid(),
  'Lucas',
  'Dubois', 
  'Université Lyon 2',
  'Codicologie médiévale',
  '+33456789012',
  'subscriber',
  true,
  'Premium',
  null
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE first_name = 'Lucas' AND last_name = 'Dubois');

INSERT INTO profiles (user_id, first_name, last_name, institution, research_field, phone, role, is_approved, partner_organization) 
SELECT 
  gen_random_uuid(),
  'Maria',
  'Rodriguez',
  'Biblioteca Nacional Madrid',
  'Manuscrits hispaniques',
  '+34987654321',
  'partner',
  true,
  'Biblioteca Nacional Madrid'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE first_name = 'Maria' AND last_name = 'Rodriguez');