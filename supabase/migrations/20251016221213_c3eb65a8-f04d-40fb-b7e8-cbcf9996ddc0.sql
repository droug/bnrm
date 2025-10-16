-- Ajouter des colonnes pour le module, formulaire et type de champ dans system_lists
ALTER TABLE public.system_lists 
ADD COLUMN IF NOT EXISTS module TEXT,
ADD COLUMN IF NOT EXISTS form_name TEXT,
ADD COLUMN IF NOT EXISTS field_type TEXT DEFAULT 'simple' CHECK (field_type IN ('simple', 'auto_select'));

-- Mettre à jour les données existantes avec le contexte
UPDATE public.system_lists 
SET module = 'Dépôt légal',
    form_name = 'Déclaration de dépôt légal – Monographies',
    field_type = 'simple'
WHERE list_code = 'TYPE_PUBLICATION';

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_system_lists_module_form ON public.system_lists(module, form_name);

COMMENT ON COLUMN public.system_lists.module IS 'Module fonctionnel auquel appartient la liste (ex: Dépôt légal, Gestion des utilisateurs)';
COMMENT ON COLUMN public.system_lists.form_name IS 'Nom du formulaire spécifique utilisant cette liste';
COMMENT ON COLUMN public.system_lists.field_type IS 'Type de champ: simple (liste déroulante) ou auto_select (autocomplétion intelligente)';
