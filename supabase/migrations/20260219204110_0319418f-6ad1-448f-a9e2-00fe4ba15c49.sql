ALTER TABLE public.document_reader_notes 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'document';

COMMENT ON COLUMN public.document_reader_notes.source IS 'Origine du retour lecteur : "search" = recherche sans résultat, "document" = notice de document';