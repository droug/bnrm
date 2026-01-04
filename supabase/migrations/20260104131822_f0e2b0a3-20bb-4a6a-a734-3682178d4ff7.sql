-- First, create the CBN document entry
WITH new_cbn AS (
  INSERT INTO public.cbn_documents (
    id,
    title,
    title_ar,
    author,
    publication_year,
    publisher,
    publication_place,
    document_type,
    cote,
    pages_count,
    is_digitized,
    access_level,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'Contes et Poèmes d''Islam',
    NULL,
    'Salem El Koubi',
    1917,
    'Jouve & Cie, Éditeurs',
    'Paris',
    'book',
    'CBN-2026-001',
    50,
    true,
    'public',
    NOW()
  )
  RETURNING id
)
-- Then create the digital library document with reference
INSERT INTO public.digital_library_documents (
  id,
  cbn_document_id,
  title,
  author,
  publication_year,
  document_type,
  cover_image_url,
  access_level,
  ocr_processed,
  pages_count,
  publication_status,
  published_at,
  language,
  requires_authentication,
  download_enabled,
  created_at
)
SELECT 
  gen_random_uuid(),
  id,
  'Contes et Poèmes d''Islam',
  'Salem El Koubi',
  1917,
  'book',
  '/documents/contes-poemes-islam-cover.jpg',
  'public',
  true,
  50,
  'published',
  NOW(),
  'fr',
  false,
  true,
  NOW()
FROM new_cbn;