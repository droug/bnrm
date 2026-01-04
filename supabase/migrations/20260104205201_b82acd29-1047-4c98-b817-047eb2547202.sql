-- =====================================================
-- Index documentaire unifié pour la GED
-- =====================================================

-- Table d'index centralisé pour tous les documents (catalogue unifié)
CREATE TABLE IF NOT EXISTS public.unified_document_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références aux sources
  source_type TEXT NOT NULL, -- 'digital_library', 'cbn', 'manuscript', 'cbm', 'content'
  source_id TEXT NOT NULL,
  
  -- Métadonnées normalisées
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT,
  author_ar TEXT,
  publication_year INTEGER,
  publisher TEXT,
  language TEXT,
  document_type TEXT,
  cote TEXT,
  
  -- Classification
  dewey_classification TEXT,
  keywords TEXT[],
  subject_headings TEXT[],
  
  -- Description
  description TEXT,
  physical_description TEXT,
  pages_count INTEGER,
  
  -- Disponibilité
  is_digitized BOOLEAN DEFAULT false,
  is_available_for_reproduction BOOLEAN DEFAULT true,
  access_level TEXT DEFAULT 'public',
  
  -- Liens
  cover_image_url TEXT,
  digital_url TEXT,
  
  -- Métadonnées système
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(source_type, source_id)
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_unified_doc_title ON public.unified_document_index(title);
CREATE INDEX IF NOT EXISTS idx_unified_doc_author ON public.unified_document_index(author);
CREATE INDEX IF NOT EXISTS idx_unified_doc_source_type ON public.unified_document_index(source_type);
CREATE INDEX IF NOT EXISTS idx_unified_doc_keywords ON public.unified_document_index USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_unified_doc_is_digitized ON public.unified_document_index(is_digitized);
CREATE INDEX IF NOT EXISTS idx_unified_doc_cote ON public.unified_document_index(cote);

-- Enable RLS
ALTER TABLE public.unified_document_index ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "unified_doc_index_select_all"
ON public.unified_document_index
FOR SELECT
TO public
USING (true);

-- Ajouter les colonnes de référence au document dans reproduction_items si nécessaire
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reproduction_items' AND column_name = 'unified_document_id'
  ) THEN
    ALTER TABLE public.reproduction_items 
    ADD COLUMN unified_document_id UUID REFERENCES public.unified_document_index(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reproduction_items' AND column_name = 'document_source_type'
  ) THEN
    ALTER TABLE public.reproduction_items 
    ADD COLUMN document_source_type TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reproduction_items' AND column_name = 'document_source_id'
  ) THEN
    ALTER TABLE public.reproduction_items 
    ADD COLUMN document_source_id TEXT;
  END IF;
END $$;

-- Trigger pour mise à jour automatique
CREATE OR REPLACE FUNCTION update_unified_doc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS unified_document_index_updated_at ON public.unified_document_index;
CREATE TRIGGER unified_document_index_updated_at
BEFORE UPDATE ON public.unified_document_index
FOR EACH ROW EXECUTE FUNCTION update_unified_doc_updated_at();

-- Fonction de recherche unifiée
CREATE OR REPLACE FUNCTION search_unified_documents(
  search_query TEXT DEFAULT NULL,
  source_filter TEXT DEFAULT NULL,
  type_filter TEXT DEFAULT NULL,
  digitized_only BOOLEAN DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id TEXT,
  title TEXT,
  title_ar TEXT,
  author TEXT,
  publication_year INTEGER,
  document_type TEXT,
  cote TEXT,
  is_digitized BOOLEAN,
  cover_image_url TEXT,
  digital_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.source_type,
    u.source_id,
    u.title,
    u.title_ar,
    u.author,
    u.publication_year,
    u.document_type,
    u.cote,
    u.is_digitized,
    u.cover_image_url,
    u.digital_url
  FROM public.unified_document_index u
  WHERE 
    (search_query IS NULL OR search_query = '' OR 
      u.title ILIKE '%' || search_query || '%'
      OR u.author ILIKE '%' || search_query || '%'
      OR u.cote ILIKE '%' || search_query || '%'
      OR u.title_ar ILIKE '%' || search_query || '%'
    )
    AND (source_filter IS NULL OR u.source_type = source_filter)
    AND (type_filter IS NULL OR u.document_type = type_filter)
    AND (digitized_only IS NULL OR digitized_only = false OR u.is_digitized = true)
  ORDER BY u.title ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour synchroniser depuis digital_library_documents
CREATE OR REPLACE FUNCTION sync_unified_from_digital_library()
RETURNS INTEGER AS $$
DECLARE
  synced_count INTEGER := 0;
BEGIN
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
  ON CONFLICT (source_type, source_id) DO UPDATE SET
    title = EXCLUDED.title,
    author = EXCLUDED.author,
    publication_year = EXCLUDED.publication_year,
    document_type = EXCLUDED.document_type,
    cover_image_url = EXCLUDED.cover_image_url,
    pages_count = EXCLUDED.pages_count,
    last_sync_at = now();
    
  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour synchroniser depuis cbn_documents
CREATE OR REPLACE FUNCTION sync_unified_from_cbn()
RETURNS INTEGER AS $$
DECLARE
  synced_count INTEGER := 0;
BEGIN
  INSERT INTO public.unified_document_index (
    source_type, source_id, title, title_ar, author, author_ar, publication_year,
    publisher, document_type, cote, dewey_classification, keywords, 
    physical_description, pages_count, is_digitized, digital_url
  )
  SELECT 
    'cbn',
    c.id::TEXT,
    c.title,
    c.title_ar,
    c.author,
    c.author_ar,
    c.publication_year,
    c.publisher,
    c.document_type,
    c.cote,
    c.dewey_classification,
    c.keywords,
    c.physical_description,
    c.pages_count,
    COALESCE(c.is_digitized, false),
    CASE WHEN c.is_digitized THEN '/digital-library/book-reader/' || c.id ELSE NULL END
  FROM public.cbn_documents c
  ON CONFLICT (source_type, source_id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    author = EXCLUDED.author,
    publication_year = EXCLUDED.publication_year,
    cote = EXCLUDED.cote,
    is_digitized = EXCLUDED.is_digitized,
    last_sync_at = now();
    
  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour synchroniser depuis manuscripts
CREATE OR REPLACE FUNCTION sync_unified_from_manuscripts()
RETURNS INTEGER AS $$
DECLARE
  synced_count INTEGER := 0;
BEGIN
  INSERT INTO public.unified_document_index (
    source_type, source_id, title, title_ar, author, author_ar,
    document_type, cote, description, physical_description, 
    pages_count, is_digitized, digital_url, access_level
  )
  SELECT 
    'manuscript',
    m.id::TEXT,
    m.title,
    m.title_ar,
    m.author,
    m.author_ar,
    'manuscript',
    m.cote,
    m.description,
    m.physical_description,
    m.folios_count,
    COALESCE(m.is_digitized, false),
    CASE WHEN m.is_digitized THEN '/manuscript-reader/' || m.id ELSE NULL END,
    m.access_level
  FROM public.manuscripts m
  ON CONFLICT (source_type, source_id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    author = EXCLUDED.author,
    cote = EXCLUDED.cote,
    is_digitized = EXCLUDED.is_digitized,
    access_level = EXCLUDED.access_level,
    last_sync_at = now();
    
  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour synchroniser depuis cbm_catalog
CREATE OR REPLACE FUNCTION sync_unified_from_cbm()
RETURNS INTEGER AS $$
DECLARE
  synced_count INTEGER := 0;
BEGIN
  INSERT INTO public.unified_document_index (
    source_type, source_id, title, title_ar, author, author_ar,
    publication_year, document_type, dewey_classification, keywords,
    is_digitized
  )
  SELECT 
    'cbm',
    c.id::TEXT,
    c.title,
    c.title_ar,
    c.author,
    c.author_ar,
    c.publication_year,
    c.document_type,
    c.dewey_classification,
    c.subject_headings,
    false
  FROM public.cbm_catalog c
  ON CONFLICT (source_type, source_id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    author = EXCLUDED.author,
    publication_year = EXCLUDED.publication_year,
    last_sync_at = now();
    
  GET DIAGNOSTICS synced_count = ROW_COUNT;
  RETURN synced_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction maître pour synchroniser toutes les sources
CREATE OR REPLACE FUNCTION sync_all_unified_documents()
RETURNS TABLE (source TEXT, synced INTEGER) AS $$
BEGIN
  RETURN QUERY SELECT 'digital_library'::TEXT, sync_unified_from_digital_library();
  RETURN QUERY SELECT 'cbn'::TEXT, sync_unified_from_cbn();
  RETURN QUERY SELECT 'manuscripts'::TEXT, sync_unified_from_manuscripts();
  RETURN QUERY SELECT 'cbm'::TEXT, sync_unified_from_cbm();
END;
$$ LANGUAGE plpgsql;