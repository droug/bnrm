-- Nettoyer les données partielles existantes
DELETE FROM cbn_documents WHERE document_type = 'Manuscrit';
DELETE FROM digital_library_documents WHERE is_manuscript = true;

-- Migration robuste pour établir la hiérarchie des catalogues
-- CBM → CBN → Digital Library → Manuscripts

-- Étape 1: Créer des entrées cbn_documents pour chaque manuscrit
WITH new_cbn_docs AS (
  INSERT INTO cbn_documents (
    id,
    cote,
    title,
    title_ar,
    author,
    document_type,
    support_type,
    physical_status,
    is_digitized,
    access_level,
    created_at,
    updated_at
  )
  SELECT 
    gen_random_uuid() as id,
    COALESCE(cote, 'MS-' || substring(id::text, 1, 8)) as cote,
    title,
    NULL as title_ar,
    author,
    'Manuscrit' as document_type,
    'Manuscrit' as support_type,
    CASE status::text
      WHEN 'available' THEN 'bon'
      WHEN 'restricted' THEN 'restauration'
      ELSE 'moyen'
    END as physical_status,
    true as is_digitized,
    access_level::text as access_level,
    created_at,
    updated_at
  FROM manuscripts
  WHERE cbn_document_id IS NULL
  RETURNING id, title, author
)
-- Étape 2: Mettre à jour les manuscrits avec les cbn_document_id créés
UPDATE manuscripts m
SET cbn_document_id = n.id
FROM new_cbn_docs n
WHERE m.title = n.title AND m.author = n.author;

-- Étape 3: Créer des entrées digital_library_documents pour chaque manuscrit
WITH new_digital_docs AS (
  INSERT INTO digital_library_documents (
    id,
    cbn_document_id,
    title,
    title_ar,
    author,
    document_type,
    language,
    pages_count,
    digitization_quality,
    file_format,
    pdf_url,
    thumbnail_url,
    cover_image_url,
    access_level,
    requires_authentication,
    download_enabled,
    print_enabled,
    is_manuscript,
    manuscript_id,
    publication_status,
    published_at,
    created_at,
    updated_at
  )
  SELECT 
    gen_random_uuid() as id,
    m.cbn_document_id,
    m.title,
    NULL as title_ar,
    m.author,
    'Manuscrit' as document_type,
    m.language,
    COALESCE(m.page_count, 0) as pages_count,
    'haute' as digitization_quality,
    'PDF' as file_format,
    m.digital_copy_url as pdf_url,
    m.thumbnail_url,
    m.thumbnail_url as cover_image_url,
    m.access_level::text as access_level,
    CASE m.access_level::text
      WHEN 'public' THEN false
      ELSE true
    END as requires_authentication,
    COALESCE(m.allow_download, true) as download_enabled,
    COALESCE(m.allow_print, true) as print_enabled,
    true as is_manuscript,
    m.id as manuscript_id,
    'published' as publication_status,
    m.created_at as published_at,
    m.created_at,
    m.updated_at
  FROM manuscripts m
  WHERE m.cbn_document_id IS NOT NULL 
    AND m.digital_library_document_id IS NULL
  RETURNING id, manuscript_id
)
-- Étape 4: Mettre à jour les manuscrits avec les digital_library_document_id créés
UPDATE manuscripts m
SET digital_library_document_id = n.id
FROM new_digital_docs n
WHERE m.id = n.manuscript_id;

-- Étape 5: Mettre à jour cbn_documents avec les digital_library_document_id
UPDATE cbn_documents c
SET digital_library_document_id = d.id
FROM digital_library_documents d
WHERE c.id = d.cbn_document_id 
  AND c.digital_library_document_id IS NULL
  AND d.is_manuscript = true;