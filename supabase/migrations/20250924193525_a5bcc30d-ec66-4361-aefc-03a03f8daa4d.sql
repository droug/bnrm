-- Ajout des permissions manquantes pour les administrateurs
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 
  'admin'::user_role,
  p.id,
  true
FROM permissions p
WHERE p.id NOT IN (
  SELECT rp.permission_id 
  FROM role_permissions rp 
  WHERE rp.role = 'admin'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Ajout de permissions spécifiques pour le contenu
INSERT INTO permissions (name, category, description) VALUES
  ('content.manage', 'content', 'Gérer tous les contenus'),
  ('legal_deposit.manage', 'legal_deposit', 'Gérer le dépôt légal'),
  ('content.archive', 'content', 'Archiver le contenu'),
  ('requests.manage', 'requests', 'Gérer toutes les demandes'),
  ('users.manage', 'users', 'Gérer complètement les utilisateurs')
ON CONFLICT (name) DO NOTHING;

-- Assigner ces nouvelles permissions aux admins
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 
  'admin'::user_role,
  p.id,
  true
FROM permissions p
WHERE p.name IN ('content.manage', 'legal_deposit.manage', 'content.archive', 'requests.manage', 'users.manage')
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;