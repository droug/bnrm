-- Ajouter les colonnes is_validated et deleted_at aux tables publishers et printers
-- pour filtrer les comptes non validés et supprimés des listes d'autocomplétion

-- Ajouter les colonnes à publishers
ALTER TABLE public.publishers 
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ajouter les colonnes à printers
ALTER TABLE public.printers 
ADD COLUMN IF NOT EXISTS is_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Mettre à jour les enregistrements existants comme validés (pour ne pas casser les données existantes)
UPDATE public.publishers SET is_validated = true WHERE is_validated IS NULL OR is_validated = false;
UPDATE public.printers SET is_validated = true WHERE is_validated IS NULL OR is_validated = false;

-- Créer des index pour améliorer les performances des requêtes filtrées
CREATE INDEX IF NOT EXISTS idx_publishers_validated ON public.publishers(is_validated) WHERE is_validated = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_printers_validated ON public.printers(is_validated) WHERE is_validated = true AND deleted_at IS NULL;

-- Commenter les colonnes pour documentation
COMMENT ON COLUMN public.publishers.is_validated IS 'Indique si le compte professionnel a été validé par un administrateur';
COMMENT ON COLUMN public.publishers.deleted_at IS 'Date de suppression soft-delete, NULL si actif';
COMMENT ON COLUMN public.printers.is_validated IS 'Indique si le compte professionnel a été validé par un administrateur';
COMMENT ON COLUMN public.printers.deleted_at IS 'Date de suppression soft-delete, NULL si actif';