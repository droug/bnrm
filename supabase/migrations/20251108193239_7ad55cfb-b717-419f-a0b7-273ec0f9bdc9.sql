
-- Insérer les permissions admin pour l'utilisateur actuel
INSERT INTO user_permissions (user_id, permission_id, granted, granted_by)
SELECT 
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid,
  p.id,
  true,
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid
FROM permissions p
WHERE p.name IN ('system.admin', 'users.manage', 'content.manage')
ON CONFLICT (user_id, permission_id) DO UPDATE
SET granted = true, updated_at = NOW();
