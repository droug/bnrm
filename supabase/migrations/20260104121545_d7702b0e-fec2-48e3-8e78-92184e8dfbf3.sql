-- Ajouter le champ digitization_source pour distinguer l'origine de la numérisation
ALTER TABLE public.digital_library_documents 
ADD COLUMN digitization_source TEXT DEFAULT 'internal' CHECK (digitization_source IN ('internal', 'external'));

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.digital_library_documents.digitization_source IS 
'Source de numérisation: internal = numérisé par la BNRM, external = reçu déjà numérisé';