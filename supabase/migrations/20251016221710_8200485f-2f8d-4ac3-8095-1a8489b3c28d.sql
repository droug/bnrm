-- Ajouter d'autres listes système avec leurs contextes de module et formulaire
-- Ces listes sont utilisées dans différents formulaires du système

-- Listes pour le module Dépôt Légal
INSERT INTO public.system_lists (list_code, list_name, description, module, form_name, field_type) 
VALUES 
  ('LANGUES', 'Langues', 'Liste des langues pour les publications', 'Dépôt légal', 'Déclaration de dépôt légal – Monographies', 'auto_select'),
  ('DISCIPLINES', 'Disciplines de l''ouvrage', 'Liste des disciplines académiques', 'Dépôt légal', 'Déclaration de dépôt légal – Monographies', 'auto_select'),
  ('TYPE_SUPPORT', 'Type de support', 'Type de support de la publication (Papier, Numérique, etc.)', 'Dépôt légal', 'Déclaration de dépôt légal – Monographies', 'simple'),
  ('NATURE_DECLARATION', 'Nature de la déclaration', 'Nature de la déclaration de dépôt légal', 'Dépôt légal', 'Déclaration de dépôt légal – Monographies', 'simple'),
  ('STATUT_AUTEUR', 'Statut de l''auteur', 'Statut professionnel de l''auteur', 'Dépôt légal', 'Identification de l''auteur', 'simple'),
  ('REGIONS_MAROC', 'Régions du Maroc', 'Liste des régions du Royaume du Maroc', 'Dépôt légal', 'Identification de l''auteur', 'auto_select'),
  ('VILLES_MAROC', 'Villes du Maroc', 'Liste des villes du Royaume du Maroc', 'Dépôt légal', 'Identification de l''auteur', 'auto_select'),
  ('TYPE_IMPRIMEUR', 'Type d''imprimeur', 'Type d''imprimeur (Public, Privé, etc.)', 'Dépôt légal', 'Identification de l''imprimeur', 'simple'),
  ('STATUT_DEMANDE', 'Statut de la demande', 'Statut du traitement de la demande', 'Dépôt légal', 'Gestion des demandes', 'simple')
ON CONFLICT (list_code) DO UPDATE 
SET 
  module = EXCLUDED.module,
  form_name = EXCLUDED.form_name,
  field_type = EXCLUDED.field_type,
  description = EXCLUDED.description;

-- Listes pour le module Manuscrits
INSERT INTO public.system_lists (list_code, list_name, description, module, form_name, field_type) 
VALUES 
  ('PERIODE_MANUSCRIT', 'Période du manuscrit', 'Période historique du manuscrit', 'Manuscrits', 'Catalogage des manuscrits', 'simple'),
  ('MATERIAU_MANUSCRIT', 'Matériau du manuscrit', 'Type de matériau (Papier, Parchemin, etc.)', 'Manuscrits', 'Catalogage des manuscrits', 'simple'),
  ('ETAT_CONSERVATION', 'État de conservation', 'État de conservation du manuscrit', 'Manuscrits', 'Catalogage des manuscrits', 'simple'),
  ('LANGUE_MANUSCRIT', 'Langue du manuscrit', 'Langue principale du manuscrit', 'Manuscrits', 'Catalogage des manuscrits', 'auto_select'),
  ('GENRE_MANUSCRIT', 'Genre littéraire', 'Genre littéraire du manuscrit', 'Manuscrits', 'Catalogage des manuscrits', 'auto_select')
ON CONFLICT (list_code) DO UPDATE 
SET 
  module = EXCLUDED.module,
  form_name = EXCLUDED.form_name,
  field_type = EXCLUDED.field_type,
  description = EXCLUDED.description;

-- Listes pour les paramètres globaux
INSERT INTO public.system_lists (list_code, list_name, description, module, form_name, field_type) 
VALUES 
  ('ROLES_UTILISATEUR', 'Rôles utilisateur', 'Rôles disponibles dans le système', 'Paramètres globaux', 'Gestion des utilisateurs', 'simple'),
  ('PERMISSIONS', 'Permissions', 'Permissions du système', 'Paramètres globaux', 'Gestion des permissions', 'simple')
ON CONFLICT (list_code) DO UPDATE 
SET 
  module = EXCLUDED.module,
  form_name = EXCLUDED.form_name,
  field_type = EXCLUDED.field_type,
  description = EXCLUDED.description;