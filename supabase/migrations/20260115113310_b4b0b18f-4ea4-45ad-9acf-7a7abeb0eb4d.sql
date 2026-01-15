-- Synchroniser les documents existants de la bibliothèque numérique vers l'index GED
INSERT INTO public.unified_document_index (
  source_type, source_id, title, author, publication_year,
  document_type, is_digitized, cover_image_url, digital_url, pages_count
)
SELECT 
  'digital_library',
  dl.id::TEXT,
  dl.title,
  dl.author,
  dl.publication_year,
  dl.document_type,
  true,
  dl.cover_image_url,
  '/digital-library/book-reader/' || dl.id,
  dl.pages_count
FROM public.digital_library_documents dl
WHERE dl.deleted_at IS NULL
ON CONFLICT (source_type, source_id) DO UPDATE SET
  title = EXCLUDED.title,
  author = EXCLUDED.author,
  publication_year = EXCLUDED.publication_year,
  document_type = EXCLUDED.document_type,
  cover_image_url = EXCLUDED.cover_image_url,
  pages_count = EXCLUDED.pages_count,
  last_sync_at = now();

-- Créer une fonction trigger pour indexer automatiquement les nouveaux documents
CREATE OR REPLACE FUNCTION public.trigger_sync_digital_library_to_ged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.unified_document_index (
      source_type, source_id, title, author, publication_year,
      document_type, is_digitized, cover_image_url, digital_url, pages_count
    ) VALUES (
      'digital_library',
      NEW.id::TEXT,
      NEW.title,
      NEW.author,
      NEW.publication_year,
      NEW.document_type,
      true,
      NEW.cover_image_url,
      '/digital-library/book-reader/' || NEW.id,
      NEW.pages_count
    )
    ON CONFLICT (source_type, source_id) DO UPDATE SET
      title = EXCLUDED.title,
      author = EXCLUDED.author,
      publication_year = EXCLUDED.publication_year,
      document_type = EXCLUDED.document_type,
      cover_image_url = EXCLUDED.cover_image_url,
      pages_count = EXCLUDED.pages_count,
      last_sync_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.unified_document_index 
    WHERE source_type = 'digital_library' AND source_id = OLD.id::TEXT;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Créer le trigger sur la table digital_library_documents
DROP TRIGGER IF EXISTS trigger_digital_library_to_ged ON public.digital_library_documents;
CREATE TRIGGER trigger_digital_library_to_ged
  AFTER INSERT OR UPDATE OR DELETE ON public.digital_library_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_sync_digital_library_to_ged();