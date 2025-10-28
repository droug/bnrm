-- Créer une table pour les listes auto-complètes hiérarchiques
CREATE TABLE public.autocomplete_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_code text NOT NULL UNIQUE,
  list_name text NOT NULL,
  description text,
  module text,
  form_name text,
  max_levels integer DEFAULT 2 CHECK (max_levels IN (1, 2)),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les valeurs des listes auto-complètes (support hiérarchique)
CREATE TABLE public.autocomplete_list_values (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES public.autocomplete_lists(id) ON DELETE CASCADE,
  value_code text NOT NULL,
  value_label text NOT NULL,
  parent_value_code text,
  level integer NOT NULL DEFAULT 1 CHECK (level IN (1, 2)),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(list_id, value_code)
);

-- Créer des index pour améliorer les performances
CREATE INDEX idx_autocomplete_lists_code ON public.autocomplete_lists(list_code);
CREATE INDEX idx_autocomplete_lists_module ON public.autocomplete_lists(module);
CREATE INDEX idx_autocomplete_values_list ON public.autocomplete_list_values(list_id);
CREATE INDEX idx_autocomplete_values_parent ON public.autocomplete_list_values(parent_value_code);
CREATE INDEX idx_autocomplete_values_level ON public.autocomplete_list_values(level);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_autocomplete_lists_updated_at
  BEFORE UPDATE ON public.autocomplete_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Activer RLS
ALTER TABLE public.autocomplete_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autocomplete_list_values ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : Lecture publique, modification admin uniquement
CREATE POLICY "Les listes autocomplete sont visibles par tous"
  ON public.autocomplete_lists FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les listes autocomplete"
  ON public.autocomplete_lists FOR ALL
  USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Les valeurs autocomplete sont visibles par tous"
  ON public.autocomplete_list_values FOR SELECT
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les valeurs autocomplete"
  ON public.autocomplete_list_values FOR ALL
  USING (public.is_admin_or_librarian(auth.uid()));

-- Insérer la liste des disciplines avec sa structure hiérarchique
INSERT INTO public.autocomplete_lists (list_code, list_name, description, module, form_name, max_levels)
VALUES (
  'book_disciplines',
  'Disciplines (Hiérarchique)',
  'Disciplines académiques organisées en catégories et sous-catégories',
  'Dépôt Légal',
  'Publications périodiques et Monographies',
  2
);

-- Insérer les valeurs de disciplines (niveau 1 - catégories principales)
INSERT INTO public.autocomplete_list_values (list_id, value_code, value_label, level, sort_order)
SELECT 
  (SELECT id FROM public.autocomplete_lists WHERE list_code = 'book_disciplines'),
  value_code,
  value_label,
  1,
  sort_order
FROM (VALUES
  ('sciences_exactes', 'Sciences exactes et naturelles', 1),
  ('sciences_vie', 'Sciences de la vie et de la santé', 2),
  ('sciences_sociales', 'Sciences sociales', 3),
  ('arts_lettres', 'Arts et lettres', 4),
  ('droit', 'Droit et sciences juridiques', 5),
  ('economie', 'Économie et gestion', 6),
  ('education', 'Éducation et formation', 7),
  ('technologie', 'Technologies et ingénierie', 8),
  ('religion', 'Religion et théologie', 9),
  ('histoire', 'Histoire et géographie', 10),
  ('philosophie', 'Philosophie et éthique', 11),
  ('communication', 'Communication et médias', 12)
) AS categories(value_code, value_label, sort_order);

-- Insérer les sous-disciplines (niveau 2)
INSERT INTO public.autocomplete_list_values (list_id, value_code, value_label, parent_value_code, level, sort_order)
SELECT 
  (SELECT id FROM public.autocomplete_lists WHERE list_code = 'book_disciplines'),
  value_code,
  value_label,
  parent_value_code,
  2,
  sort_order
FROM (VALUES
  -- Sciences exactes et naturelles
  ('mathematiques', 'Mathématiques', 'sciences_exactes', 1),
  ('physique', 'Physique', 'sciences_exactes', 2),
  ('chimie', 'Chimie', 'sciences_exactes', 3),
  ('astronomie', 'Astronomie', 'sciences_exactes', 4),
  ('geologie', 'Géologie', 'sciences_exactes', 5),
  
  -- Sciences de la vie
  ('biologie', 'Biologie', 'sciences_vie', 1),
  ('medecine', 'Médecine', 'sciences_vie', 2),
  ('pharmacie', 'Pharmacie', 'sciences_vie', 3),
  ('sciences_infirmieres', 'Sciences infirmières', 'sciences_vie', 4),
  ('nutrition', 'Nutrition et diététique', 'sciences_vie', 5),
  ('psychologie', 'Psychologie', 'sciences_vie', 6),
  
  -- Sciences sociales
  ('sociologie', 'Sociologie', 'sciences_sociales', 1),
  ('anthropologie', 'Anthropologie', 'sciences_sociales', 2),
  ('science_politique', 'Science politique', 'sciences_sociales', 3),
  ('relations_internationales', 'Relations internationales', 'sciences_sociales', 4),
  ('travail_social', 'Travail social', 'sciences_sociales', 5),
  
  -- Arts et lettres
  ('litterature', 'Littérature', 'arts_lettres', 1),
  ('linguistique', 'Linguistique', 'arts_lettres', 2),
  ('arts_plastiques', 'Arts plastiques', 'arts_lettres', 3),
  ('musique', 'Musique', 'arts_lettres', 4),
  ('theatre', 'Théâtre', 'arts_lettres', 5),
  ('cinema', 'Cinéma', 'arts_lettres', 6),
  ('architecture', 'Architecture', 'arts_lettres', 7),
  
  -- Droit
  ('droit_prive', 'Droit privé', 'droit', 1),
  ('droit_public', 'Droit public', 'droit', 2),
  ('droit_penal', 'Droit pénal', 'droit', 3),
  ('droit_international', 'Droit international', 'droit', 4),
  ('droit_affaires', 'Droit des affaires', 'droit', 5),
  
  -- Économie et gestion
  ('economie_generale', 'Économie générale', 'economie', 1),
  ('finance', 'Finance', 'economie', 2),
  ('comptabilite', 'Comptabilité', 'economie', 3),
  ('management', 'Management', 'economie', 4),
  ('marketing', 'Marketing', 'economie', 5),
  ('ressources_humaines', 'Ressources humaines', 'economie', 6),
  
  -- Éducation
  ('pedagogie', 'Pédagogie', 'education', 1),
  ('didactique', 'Didactique', 'education', 2),
  ('formation_adultes', 'Formation des adultes', 'education', 3),
  ('education_specialisee', 'Éducation spécialisée', 'education', 4),
  
  -- Technologie et ingénierie
  ('informatique', 'Informatique', 'technologie', 1),
  ('genie_civil', 'Génie civil', 'technologie', 2),
  ('genie_mecanique', 'Génie mécanique', 'technologie', 3),
  ('genie_electrique', 'Génie électrique', 'technologie', 4),
  ('genie_industriel', 'Génie industriel', 'technologie', 5),
  ('telecommunications', 'Télécommunications', 'technologie', 6),
  
  -- Religion
  ('etudes_islamiques', 'Études islamiques', 'religion', 1),
  ('theologie_chretienne', 'Théologie chrétienne', 'religion', 2),
  ('etudes_judaiques', 'Études judaïques', 'religion', 3),
  ('histoire_religions', 'Histoire des religions', 'religion', 4),
  
  -- Histoire et géographie
  ('histoire_generale', 'Histoire générale', 'histoire', 1),
  ('histoire_maroc', 'Histoire du Maroc', 'histoire', 2),
  ('geographie_humaine', 'Géographie humaine', 'histoire', 3),
  ('geographie_physique', 'Géographie physique', 'histoire', 4),
  ('archeologie', 'Archéologie', 'histoire', 5),
  
  -- Philosophie
  ('philosophie_generale', 'Philosophie générale', 'philosophie', 1),
  ('ethique', 'Éthique', 'philosophie', 2),
  ('logique', 'Logique', 'philosophie', 3),
  ('epistemologie', 'Épistémologie', 'philosophie', 4),
  
  -- Communication et médias
  ('journalisme', 'Journalisme', 'communication', 1),
  ('communication_organisationnelle', 'Communication organisationnelle', 'communication', 2),
  ('relations_publiques', 'Relations publiques', 'communication', 3),
  ('medias_numeriques', 'Médias numériques', 'communication', 4)
) AS subdisciplines(value_code, value_label, parent_value_code, sort_order);