-- Étape 2: Ajouter les permissions manquantes pour tous les modules du système

-- Permissions pour les Activités Culturelles
INSERT INTO public.permissions (name, category, description) VALUES
  -- Réservations d'espaces
  ('cultural_bookings.view', 'cultural_activities', 'Voir les réservations d''espaces'),
  ('cultural_bookings.create', 'cultural_activities', 'Créer des réservations'),
  ('cultural_bookings.edit', 'cultural_activities', 'Modifier les réservations'),
  ('cultural_bookings.approve', 'cultural_activities', 'Approuver les réservations'),
  ('cultural_bookings.delete', 'cultural_activities', 'Supprimer les réservations'),
  
  -- Visites guidées
  ('cultural_visits.view', 'cultural_activities', 'Voir les visites guidées'),
  ('cultural_visits.create', 'cultural_activities', 'Créer des visites'),
  ('cultural_visits.edit', 'cultural_activities', 'Modifier les visites'),
  ('cultural_visits.manage_slots', 'cultural_activities', 'Gérer les créneaux'),
  
  -- Partenariats
  ('cultural_partnerships.view', 'cultural_activities', 'Voir les partenariats'),
  ('cultural_partnerships.create', 'cultural_activities', 'Créer des partenariats'),
  ('cultural_partnerships.edit', 'cultural_activities', 'Modifier les partenariats'),
  ('cultural_partnerships.approve', 'cultural_activities', 'Approuver les partenariats'),
  
  -- Programmation culturelle
  ('cultural_programming.view', 'cultural_activities', 'Voir la programmation'),
  ('cultural_programming.create', 'cultural_activities', 'Créer des programmes'),
  ('cultural_programming.edit', 'cultural_activities', 'Modifier la programmation'),
  ('cultural_programming.publish', 'cultural_activities', 'Publier des programmes'),
  
  -- Espaces culturels
  ('cultural_spaces.view', 'cultural_activities', 'Voir les espaces'),
  ('cultural_spaces.manage', 'cultural_activities', 'Gérer les espaces'),
  
  -- Tarification
  ('cultural_tariffs.view', 'cultural_activities', 'Voir les tarifs'),
  ('cultural_tariffs.manage', 'cultural_activities', 'Gérer les tarifs'),
  
  -- Rapports et statistiques
  ('cultural_reports.view', 'cultural_activities', 'Voir les rapports'),
  ('cultural_reports.export', 'cultural_activities', 'Exporter les rapports')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour les Workflows
INSERT INTO public.permissions (name, category, description) VALUES
  ('workflows.view', 'workflows', 'Voir les workflows'),
  ('workflows.create', 'workflows', 'Créer des workflows'),
  ('workflows.edit', 'workflows', 'Modifier les workflows'),
  ('workflows.delete', 'workflows', 'Supprimer les workflows'),
  ('workflows.manage', 'workflows', 'Gestion complète des workflows'),
  ('workflows.execute', 'workflows', 'Exécuter les workflows')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour les Paiements
INSERT INTO public.permissions (name, category, description) VALUES
  ('payments.view', 'payments', 'Voir les paiements'),
  ('payments.process', 'payments', 'Traiter les paiements'),
  ('payments.refund', 'payments', 'Effectuer des remboursements'),
  ('payments.manage', 'payments', 'Gestion complète des paiements'),
  ('wallets.view', 'payments', 'Voir les portefeuilles'),
  ('wallets.manage', 'payments', 'Gérer les portefeuilles')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour les Reproductions
INSERT INTO public.permissions (name, category, description) VALUES
  ('reproductions.view', 'reproductions', 'Voir les demandes de reproduction'),
  ('reproductions.create', 'reproductions', 'Créer des demandes'),
  ('reproductions.approve', 'reproductions', 'Approuver les demandes'),
  ('reproductions.manage', 'reproductions', 'Gestion complète des reproductions')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour les Expositions Virtuelles
INSERT INTO public.permissions (name, category, description) VALUES
  ('exhibitions.view', 'exhibitions', 'Voir les expositions'),
  ('exhibitions.create', 'exhibitions', 'Créer des expositions'),
  ('exhibitions.edit', 'exhibitions', 'Modifier les expositions'),
  ('exhibitions.publish', 'exhibitions', 'Publier des expositions'),
  ('exhibitions.manage', 'exhibitions', 'Gestion complète des expositions')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour la Numérisation
INSERT INTO public.permissions (name, category, description) VALUES
  ('digitization.view', 'digitization', 'Voir les demandes de numérisation'),
  ('digitization.create', 'digitization', 'Créer des demandes'),
  ('digitization.process', 'digitization', 'Traiter les demandes'),
  ('digitization.manage', 'digitization', 'Gestion complète de la numérisation')
ON CONFLICT (name) DO NOTHING;

-- Permissions pour les Modèles de Documents
INSERT INTO public.permissions (name, category, description) VALUES
  ('templates.view', 'templates', 'Voir les modèles'),
  ('templates.create', 'templates', 'Créer des modèles'),
  ('templates.edit', 'templates', 'Modifier les modèles'),
  ('templates.delete', 'templates', 'Supprimer les modèles'),
  ('templates.manage', 'templates', 'Gestion complète des modèles')
ON CONFLICT (name) DO NOTHING;

-- Créer les permissions de rôle pour Admin (accès complet)
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'admin', id, true
FROM public.permissions
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Permissions pour le rôle DAC
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'dac', id, true
FROM public.permissions
WHERE category = 'cultural_activities'
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'dac', id, true
FROM public.permissions
WHERE name IN (
  'content.view', 'content.create', 'content.edit', 'content.publish',
  'templates.view', 'templates.manage',
  'users.view'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Permissions pour le rôle Comptable
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'comptable', id, true
FROM public.permissions
WHERE category IN ('payments', 'cultural_activities')
  AND name LIKE '%view%'
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'comptable', id, true
FROM public.permissions
WHERE name IN (
  'payments.manage', 'wallets.manage',
  'cultural_tariffs.manage', 'cultural_reports.view', 'cultural_reports.export',
  'cultural_bookings.view', 'cultural_bookings.approve'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Permissions pour le rôle Direction
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'direction', id, true
FROM public.permissions
WHERE name LIKE '%view%' OR name LIKE '%reports%'
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'direction', id, true
FROM public.permissions
WHERE name IN (
  'cultural_partnerships.approve',
  'cultural_programming.publish',
  'users.approve',
  'legal_deposit.validate'
)
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Permissions pour le rôle Lecture seule
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'read_only', id, true
FROM public.permissions
WHERE name LIKE '%view%'
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;

-- Permissions pour le rôle Librarian
INSERT INTO public.role_permissions (role, permission_id, granted)
SELECT 'librarian', id, true
FROM public.permissions
WHERE category IN ('collections', 'content', 'manuscripts', 'legal_deposit', 'digitization', 'reproductions')
ON CONFLICT (role, permission_id) DO UPDATE SET granted = true;