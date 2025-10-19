-- Ajouter les colonnes manquantes pour le système de listes hiérarchiques

-- Ajouter is_hierarchical à system_lists
ALTER TABLE public.system_lists
ADD COLUMN IF NOT EXISTS is_hierarchical BOOLEAN DEFAULT false;

-- Ajouter parent_code à system_list_values
ALTER TABLE public.system_list_values
ADD COLUMN IF NOT EXISTS parent_code TEXT;

-- Créer l'index pour les recherches hiérarchiques
CREATE INDEX IF NOT EXISTS idx_system_list_values_parent_code 
ON public.system_list_values(parent_code);

-- Mettre à jour les listes existantes avec is_hierarchical
UPDATE public.system_lists
SET is_hierarchical = false
WHERE is_hierarchical IS NULL;

-- Commentaires
COMMENT ON COLUMN public.system_lists.is_hierarchical IS 'Indique si la liste supporte une structure hiérarchique à 2 niveaux';
COMMENT ON COLUMN public.system_list_values.parent_code IS 'Code du parent pour les listes hiérarchiques (discipline parente, catégorie principale, etc.)';
