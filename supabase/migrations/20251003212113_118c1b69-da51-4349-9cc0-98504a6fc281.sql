-- Ajout de champs pour les versions et métadonnées complètes des manuscrits
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS ocr_text text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS ocr_pages jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS translations jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS versions jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS page_structure jsonb DEFAULT '[]'::jsonb;

-- Table pour stocker les pages OCR individuelles avec structure
CREATE TABLE IF NOT EXISTS public.manuscript_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  image_url text,
  ocr_text text,
  paragraphs jsonb DEFAULT '[]'::jsonb,
  word_coordinates jsonb DEFAULT '[]'::jsonb,
  translations jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(manuscript_id, page_number)
);

-- Index pour les pages
CREATE INDEX IF NOT EXISTS idx_manuscript_pages_manuscript ON manuscript_pages(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_manuscript_pages_page_number ON manuscript_pages(page_number);
CREATE INDEX IF NOT EXISTS idx_manuscript_pages_ocr_text ON manuscript_pages USING gin(to_tsvector('french', coalesce(ocr_text, '')));

-- RLS pour manuscript_pages
ALTER TABLE public.manuscript_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage manuscript pages"
ON public.manuscript_pages
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view visible manuscript pages"
ON public.manuscript_pages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM manuscripts m
    WHERE m.id = manuscript_pages.manuscript_id
    AND m.is_visible = true
  )
);

-- Fonction pour rechercher dans les pages avec contexte
CREATE OR REPLACE FUNCTION search_manuscript_pages(
  p_manuscript_id uuid,
  p_query text,
  p_context_words integer DEFAULT 10
)
RETURNS TABLE (
  page_id uuid,
  page_number integer,
  matches jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.id,
    mp.page_number,
    jsonb_build_object(
      'text', mp.ocr_text,
      'paragraphs', mp.paragraphs,
      'positions', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'start', position,
            'length', length(p_query),
            'context', substring(
              mp.ocr_text,
              GREATEST(1, position - p_context_words * 6),
              p_context_words * 12 + length(p_query)
            )
          )
        )
        FROM (
          SELECT unnest(string_to_array(
            regexp_replace(lower(mp.ocr_text), '\s+', ' ', 'g'),
            lower(p_query)
          )) as position
        ) positions
        WHERE position > 0
      )
    ) as matches
  FROM manuscript_pages mp
  WHERE mp.manuscript_id = p_manuscript_id
  AND mp.ocr_text ILIKE '%' || p_query || '%'
  ORDER BY mp.page_number;
END;
$$;

-- Trigger pour mettre à jour le texte plein des manuscrits depuis les pages
CREATE OR REPLACE FUNCTION update_manuscript_from_pages()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE manuscripts
  SET 
    ocr_text = (
      SELECT string_agg(ocr_text, E'\n\n')
      FROM manuscript_pages
      WHERE manuscript_id = NEW.manuscript_id
      ORDER BY page_number
    ),
    updated_at = NOW()
  WHERE id = NEW.manuscript_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_manuscript_from_pages_trigger ON manuscript_pages;
CREATE TRIGGER update_manuscript_from_pages_trigger
AFTER INSERT OR UPDATE OF ocr_text ON manuscript_pages
FOR EACH ROW
EXECUTE FUNCTION update_manuscript_from_pages();