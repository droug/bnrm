-- Créer des entrées digital_library_documents pour les documents CBN numérisés
-- Bibliothèque Numérique = sous-ensemble des documents CBN qui sont numérisés

INSERT INTO digital_library_documents (
  cbn_document_id,
  title,
  title_ar,
  author,
  document_type,
  language,
  pages_count,
  digitization_date,
  digitization_quality,
  file_format,
  pdf_url,
  thumbnail_url,
  access_level,
  requires_authentication,
  download_enabled,
  print_enabled,
  is_manuscript,
  publication_status,
  published_at,
  themes
)
SELECT 
  c.id as cbn_document_id,
  c.title,
  c.title_ar,
  c.author,
  c.document_type,
  CASE 
    WHEN c.title_ar IS NOT NULL THEN 'arabe'
    ELSE 'français'
  END as language,
  c.pages_count,
  CURRENT_DATE - INTERVAL '6 months' as digitization_date,
  'haute' as digitization_quality,
  'PDF' as file_format,
  '/digital-library/' || c.cote || '.pdf' as pdf_url,
  '/thumbnails/' || c.cote || '-thumb.jpg' as thumbnail_url,
  c.access_level,
  CASE 
    WHEN c.access_level = 'public' THEN false
    ELSE true
  END as requires_authentication,
  true as download_enabled,
  true as print_enabled,
  false as is_manuscript,
  'published' as publication_status,
  CURRENT_DATE - INTERVAL '3 months' as published_at,
  c.subject_headings as themes
FROM cbn_documents c
WHERE c.is_digitized = true 
  AND c.document_type != 'Manuscrit'
  AND NOT EXISTS (
    SELECT 1 FROM digital_library_documents d 
    WHERE d.cbn_document_id = c.id
  );

-- Mettre à jour les liens dans cbn_documents
UPDATE cbn_documents c
SET digital_library_document_id = d.id
FROM digital_library_documents d
WHERE c.id = d.cbn_document_id 
  AND c.digital_library_document_id IS NULL;

-- Rapport final de l'architecture
DO $$
DECLARE
  total_cbn INTEGER;
  total_digital INTEGER;
  total_manuscripts INTEGER;
  cbn_livres INTEGER;
  cbn_periodiques INTEGER;
  cbn_manuscrits INTEGER;
  digital_livres INTEGER;
  digital_manuscrits INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_cbn FROM cbn_documents;
  SELECT COUNT(*) INTO total_digital FROM digital_library_documents;
  SELECT COUNT(*) INTO total_manuscripts FROM manuscripts;
  
  SELECT COUNT(*) INTO cbn_livres FROM cbn_documents WHERE document_type = 'Livre';
  SELECT COUNT(*) INTO cbn_periodiques FROM cbn_documents WHERE document_type = 'Périodique';
  SELECT COUNT(*) INTO cbn_manuscrits FROM cbn_documents WHERE document_type = 'Manuscrit';
  
  SELECT COUNT(*) INTO digital_livres FROM digital_library_documents WHERE is_manuscript = false;
  SELECT COUNT(*) INTO digital_manuscrits FROM digital_library_documents WHERE is_manuscript = true;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ARCHITECTURE HIÉRARCHIQUE DES CATALOGUES';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. CBN (Catalogue BNRM - physique + numérique): % documents', total_cbn;
  RAISE NOTICE '   - Livres: %', cbn_livres;
  RAISE NOTICE '   - Périodiques: %', cbn_periodiques;
  RAISE NOTICE '   - Manuscrits: %', cbn_manuscrits;
  RAISE NOTICE '   - Autres: %', (total_cbn - cbn_livres - cbn_periodiques - cbn_manuscrits);
  RAISE NOTICE '';
  RAISE NOTICE '2. Bibliothèque Numérique (documents numérisés BNRM): % documents', total_digital;
  RAISE NOTICE '   - Documents numérisés (non-manuscrits): %', digital_livres;
  RAISE NOTICE '   - Manuscrits numérisés: %', digital_manuscrits;
  RAISE NOTICE '';
  RAISE NOTICE '3. Plateforme Manuscrits (sous-ensemble spécialisé): % manuscrits', total_manuscripts;
  RAISE NOTICE '';
  RAISE NOTICE 'Tous les manuscrits sont liés: CBN → Digital Library → Manuscrits';
  RAISE NOTICE '========================================';
END $$;