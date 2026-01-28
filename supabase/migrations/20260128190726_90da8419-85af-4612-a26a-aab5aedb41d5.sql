-- Ajouter les colonnes pour les pages manquantes et leur raison
ALTER TABLE public.page_access_restrictions
ADD COLUMN IF NOT EXISTS missing_pages integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS missing_pages_reason text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS missing_pages_custom_reason text DEFAULT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN public.page_access_restrictions.missing_pages IS 'Liste des numéros de pages manquantes du document';
COMMENT ON COLUMN public.page_access_restrictions.missing_pages_reason IS 'Raison prédéfinie de la non-disponibilité des pages manquantes';
COMMENT ON COLUMN public.page_access_restrictions.missing_pages_custom_reason IS 'Raison personnalisée si "Autre" est sélectionné';