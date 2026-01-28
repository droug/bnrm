-- Créer l'entrée dans cbn_documents pour le document vidéo manquant
INSERT INTO cbn_documents (
  id,
  title,
  document_type,
  cote,
  digital_library_document_id,
  is_digitized,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  d.title,
  d.document_type,
  'VID-' || substring(d.id::text from 1 for 8),
  d.id,
  true,
  NOW(),
  NOW()
FROM digital_library_documents d
WHERE d.id = 'd2af5cf4-b968-4b2d-81de-eb5258439bbd'
AND NOT EXISTS (
  SELECT 1 FROM cbn_documents c WHERE c.digital_library_document_id = d.id
);

-- Mettre à jour le statut de publication du document
UPDATE digital_library_documents
SET publication_status = 'published'
WHERE id = 'd2af5cf4-b968-4b2d-81de-eb5258439bbd';