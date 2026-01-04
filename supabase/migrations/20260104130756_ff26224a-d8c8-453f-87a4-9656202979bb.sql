-- Table pour stocker le contenu OCR des pages de la bibliothèque numérique
CREATE TABLE IF NOT EXISTS public.digital_library_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.digital_library_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT,
  ocr_text TEXT,
  paragraphs JSONB DEFAULT '[]'::jsonb,
  word_coordinates JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, page_number)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_digital_library_pages_document_id ON public.digital_library_pages(document_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_pages_ocr_text ON public.digital_library_pages USING gin(to_tsvector('french', coalesce(ocr_text, '')));

-- Enable RLS
ALTER TABLE public.digital_library_pages ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique
CREATE POLICY "Digital library pages are viewable by everyone" 
ON public.digital_library_pages 
FOR SELECT 
USING (true);

-- Policy pour modification par les admins (utilise la fonction is_admin_or_librarian existante)
CREATE POLICY "Admins can manage digital library pages" 
ON public.digital_library_pages 
FOR ALL 
USING (public.is_admin_or_librarian(auth.uid()));

-- Fonction de recherche simplifiée dans les pages d'un document numérique
CREATE OR REPLACE FUNCTION public.search_digital_library_pages(
  p_document_id UUID,
  p_query TEXT,
  p_context_words INTEGER DEFAULT 10
)
RETURNS TABLE (
  page_id UUID,
  page_number INTEGER,
  ocr_text TEXT,
  match_count INTEGER
) 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS page_id,
    p.page_number,
    p.ocr_text,
    (length(p.ocr_text) - length(replace(lower(p.ocr_text), lower(p_query), ''))) / GREATEST(length(p_query), 1) AS match_count
  FROM public.digital_library_pages p
  WHERE p.document_id = p_document_id
    AND lower(p.ocr_text) LIKE '%' || lower(p_query) || '%'
  ORDER BY p.page_number;
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_digital_library_pages_updated_at
BEFORE UPDATE ON public.digital_library_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();