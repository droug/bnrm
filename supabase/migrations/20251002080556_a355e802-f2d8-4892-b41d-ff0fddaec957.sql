-- Insert comprehensive permissions organized by categories
-- Clear existing permissions first
TRUNCATE TABLE public.permissions CASCADE;
TRUNCATE TABLE public.role_permissions CASCADE;

-- Collections permissions
INSERT INTO public.permissions (name, category, description) VALUES
('collections.view', 'collections', 'Voir les collections'),
('collections.create', 'collections', 'Créer des collections'),
('collections.edit', 'collections', 'Modifier les collections'),
('collections.delete', 'collections', 'Supprimer les collections'),
('collections.manage', 'collections', 'Gestion complète des collections');

-- Content permissions
INSERT INTO public.permissions (name, category, description) VALUES
('content.view', 'content', 'Voir le contenu'),
('content.create', 'content', 'Créer du contenu'),
('content.edit', 'content', 'Modifier le contenu'),
('content.delete', 'content', 'Supprimer le contenu'),
('content.publish', 'content', 'Publier du contenu'),
('content.archive', 'content', 'Archiver du contenu'),
('content.manage', 'content', 'Gestion complète du contenu');

-- Legal deposit permissions
INSERT INTO public.permissions (name, category, description) VALUES
('legal_deposit.view', 'legal_deposit', 'Voir les dépôts légaux'),
('legal_deposit.create', 'legal_deposit', 'Créer des dépôts légaux'),
('legal_deposit.edit', 'legal_deposit', 'Modifier les dépôts légaux'),
('legal_deposit.validate', 'legal_deposit', 'Valider les dépôts légaux'),
('legal_deposit.manage', 'legal_deposit', 'Gestion complète des dépôts légaux');

-- Manuscripts permissions
INSERT INTO public.permissions (name, category, description) VALUES
('manuscripts.view', 'manuscripts', 'Voir les manuscrits'),
('manuscripts.create', 'manuscripts', 'Ajouter des manuscrits'),
('manuscripts.edit', 'manuscripts', 'Modifier les manuscrits'),
('manuscripts.delete', 'manuscripts', 'Supprimer les manuscrits'),
('manuscripts.download', 'manuscripts', 'Télécharger les manuscrits'),
('manuscripts.manage', 'manuscripts', 'Gestion complète des manuscrits');

-- Requests permissions
INSERT INTO public.permissions (name, category, description) VALUES
('requests.view', 'requests', 'Voir les demandes'),
('requests.create', 'requests', 'Créer des demandes'),
('requests.approve', 'requests', 'Approuver les demandes'),
('requests.reject', 'requests', 'Rejeter les demandes'),
('requests.manage', 'requests', 'Gestion complète des demandes');

-- Subscriptions permissions
INSERT INTO public.permissions (name, category, description) VALUES
('subscriptions.view', 'subscriptions', 'Voir les abonnements'),
('subscriptions.create', 'subscriptions', 'Créer des abonnements'),
('subscriptions.edit', 'subscriptions', 'Modifier les abonnements'),
('subscriptions.delete', 'subscriptions', 'Supprimer les abonnements'),
('subscriptions.manage', 'subscriptions', 'Gestion complète des abonnements');

-- System permissions
INSERT INTO public.permissions (name, category, description) VALUES
('system.settings', 'system', 'Accès aux paramètres système'),
('system.logs', 'system', 'Voir les journaux système'),
('system.backup', 'system', 'Sauvegarder le système'),
('system.restore', 'system', 'Restaurer le système'),
('system.admin', 'system', 'Administration système complète');

-- Users permissions
INSERT INTO public.permissions (name, category, description) VALUES
('users.view', 'users', 'Voir les utilisateurs'),
('users.create', 'users', 'Créer des utilisateurs'),
('users.edit', 'users', 'Modifier les utilisateurs'),
('users.delete', 'users', 'Supprimer les utilisateurs'),
('users.approve', 'users', 'Approuver les utilisateurs'),
('users.manage', 'users', 'Gestion complète des utilisateurs'),
('users.roles', 'users', 'Gérer les rôles utilisateurs'),
('users.permissions', 'users', 'Gérer les permissions utilisateurs');

-- Assign permissions to admin role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'admin', id, true FROM public.permissions;

-- Assign permissions to librarian role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'librarian', id, true FROM public.permissions
WHERE category IN ('collections', 'content', 'manuscripts', 'requests');

-- Assign permissions to researcher role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'researcher', id, true FROM public.permissions
WHERE name IN ('manuscripts.view', 'manuscripts.download', 'requests.create', 'requests.view', 'content.view', 'collections.view');

-- Assign permissions to partner role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'partner', id, true FROM public.permissions
WHERE name IN ('manuscripts.view', 'manuscripts.download', 'requests.create', 'requests.view', 'content.view', 'collections.view');

-- Assign permissions to subscriber role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'subscriber', id, true FROM public.permissions
WHERE name IN ('manuscripts.view', 'manuscripts.download', 'requests.create', 'requests.view', 'content.view', 'collections.view');

-- Assign permissions to public_user role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'public_user', id, true FROM public.permissions
WHERE name IN ('manuscripts.view', 'content.view', 'collections.view', 'requests.create', 'requests.view');

-- Assign permissions to visitor role
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'visitor', id, true FROM public.permissions
WHERE name IN ('manuscripts.view', 'content.view', 'collections.view');