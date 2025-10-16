-- Mettre à jour et ajouter toutes les listes système identifiées dans le projet

-- Mise à jour des listes existantes et ajout de nouvelles listes
INSERT INTO public.system_lists (list_code, list_name, description, module, form_name, field_type) 
VALUES 
  -- Module Dépôt légal
  ('TYPE_PUBLICATION', 'Type de publication', 'Type de publication (Coran, Thèse, Beau livre, etc.)', 'Dépôt légal', 'Déclaration - Identification de la publication', 'simple'),
  ('LANGUES', 'Langues', 'Langues des publications', 'Dépôt légal', 'Déclaration - Identification de la publication', 'auto_select'),
  ('DISCIPLINES', 'Disciplines', 'Disciplines académiques de l''ouvrage', 'Dépôt légal', 'Déclaration - Identification de la publication', 'auto_select'),
  ('TYPE_SUPPORT', 'Type de support', 'Support de la publication (Papier, Numérique, etc.)', 'Dépôt légal', 'Déclaration - Identification de la publication', 'simple'),
  ('NATURE_DECLARATION', 'Nature de la déclaration', 'Nature de la déclaration de dépôt légal', 'Dépôt légal', 'Déclaration - Informations générales', 'simple'),
  
  -- Auteur/Editeur/Imprimeur
  ('STATUT_AUTEUR', 'Statut de l''auteur', 'Statut professionnel de l''auteur', 'Dépôt légal', 'Déclaration - Identification de l''auteur', 'simple'),
  ('REGIONS_MAROC', 'Régions du Maroc', 'Régions administratives du Maroc', 'Dépôt légal', 'Déclaration - Identification de l''auteur', 'auto_select'),
  ('VILLES_MAROC', 'Villes du Maroc', 'Villes du Maroc par région', 'Dépôt légal', 'Déclaration - Identification de l''auteur', 'auto_select'),
  ('TYPE_IMPRIMEUR', 'Type d''imprimeur', 'Type d''imprimeur (Public, Privé)', 'Dépôt légal', 'Déclaration - Identification de l''imprimeur', 'simple'),
  ('TYPE_EDITEUR', 'Type d''éditeur', 'Type d''éditeur (Public, Privé, Indépendant)', 'Dépôt légal', 'Déclaration - Identification de l''éditeur', 'simple'),
  
  -- Workflow et statuts
  ('STATUT_DEMANDE', 'Statut de la demande', 'Statut du traitement de la demande de dépôt légal', 'Dépôt légal', 'Gestion des demandes', 'simple'),
  ('ETAPE_WORKFLOW', 'Étape du workflow', 'Étapes du processus de validation', 'Dépôt légal', 'Workflow de validation', 'simple'),
  
  -- Module Manuscrits
  ('PERIODE_MANUSCRIT', 'Période du manuscrit', 'Période historique (Médiéval, Moderne, etc.)', 'Manuscrits', 'Catalogage - Informations générales', 'simple'),
  ('MATERIAU_MANUSCRIT', 'Matériau', 'Type de support (Papier, Parchemin, Papyrus)', 'Manuscrits', 'Catalogage - État physique', 'simple'),
  ('ETAT_CONSERVATION', 'État de conservation', 'État de conservation du manuscrit', 'Manuscrits', 'Catalogage - État physique', 'simple'),
  ('LANGUE_MANUSCRIT', 'Langue du manuscrit', 'Langue principale du texte', 'Manuscrits', 'Catalogage - Contenu', 'auto_select'),
  ('GENRE_MANUSCRIT', 'Genre littéraire', 'Genre du manuscrit (Religieux, Philosophique, etc.)', 'Manuscrits', 'Catalogage - Contenu', 'auto_select'),
  ('SCRIPT_MANUSCRIT', 'Type d''écriture', 'Type d''écriture (Maghrébi, Kufique, Naskh, etc.)', 'Manuscrits', 'Catalogage - Caractéristiques', 'simple'),
  
  -- Module Bibliothèque numérique
  ('TYPE_DOCUMENT', 'Type de document', 'Type de document numérique', 'Bibliothèque numérique', 'Gestion des documents', 'simple'),
  ('CATEGORIE_CONTENU', 'Catégorie de contenu', 'Catégorie du contenu numérique', 'Bibliothèque numérique', 'Gestion du contenu', 'simple'),
  ('NIVEAU_ACCES', 'Niveau d''accès', 'Niveau d''accès au document', 'Bibliothèque numérique', 'Gestion des restrictions', 'simple'),
  ('FORMAT_FICHIER', 'Format de fichier', 'Format du fichier numérique (PDF, EPUB, etc.)', 'Bibliothèque numérique', 'Gestion des formats', 'simple'),
  
  -- Module BNRM Services
  ('TYPE_SERVICE_BNRM', 'Type de service BNRM', 'Services proposés par la BNRM', 'Services BNRM', 'Gestion des services', 'simple'),
  ('TARIF_CATEGORIE', 'Catégorie tarifaire', 'Catégories de tarification', 'Services BNRM', 'Gestion des tarifs', 'simple'),
  ('STATUT_PAIEMENT', 'Statut de paiement', 'Statut du paiement (Payé, En attente, etc.)', 'Services BNRM', 'Gestion des paiements', 'simple'),
  ('MODE_PAIEMENT', 'Mode de paiement', 'Modes de paiement acceptés', 'Services BNRM', 'Gestion des paiements', 'simple'),
  
  -- Module Reproduction
  ('TYPE_REPRODUCTION', 'Type de reproduction', 'Type de reproduction demandée', 'Reproduction', 'Demande de reproduction', 'simple'),
  ('QUALITE_REPRODUCTION', 'Qualité', 'Qualité de la reproduction', 'Reproduction', 'Demande de reproduction', 'simple'),
  ('STATUT_REPRODUCTION', 'Statut de la demande', 'Statut de traitement de la demande', 'Reproduction', 'Suivi des demandes', 'simple'),
  
  -- Module CBM (Catalogue Bibliographique Marocain)
  ('TYPE_NOTICE_CBM', 'Type de notice', 'Type de notice bibliographique', 'CBM', 'Catalogage bibliographique', 'simple'),
  ('STATUT_NOTICE', 'Statut de la notice', 'Statut de validation de la notice', 'CBM', 'Gestion des notices', 'simple'),
  
  -- Paramètres généraux du système
  ('ROLES_UTILISATEUR', 'Rôles utilisateur', 'Rôles disponibles dans le système', 'Administration', 'Gestion des utilisateurs', 'simple'),
  ('PERMISSIONS', 'Permissions', 'Permissions du système', 'Administration', 'Gestion des permissions', 'simple'),
  ('TYPE_NOTIFICATION', 'Type de notification', 'Types de notifications système', 'Administration', 'Gestion des notifications', 'simple'),
  ('PRIORITE', 'Priorité', 'Niveaux de priorité', 'Administration', 'Paramètres généraux', 'simple'),
  ('STATUT_GENERAL', 'Statut général', 'Statuts génériques du système', 'Administration', 'Paramètres généraux', 'simple')
  
ON CONFLICT (list_code) DO UPDATE 
SET 
  list_name = EXCLUDED.list_name,
  description = EXCLUDED.description,
  module = EXCLUDED.module,
  form_name = EXCLUDED.form_name,
  field_type = EXCLUDED.field_type,
  updated_at = NOW();
