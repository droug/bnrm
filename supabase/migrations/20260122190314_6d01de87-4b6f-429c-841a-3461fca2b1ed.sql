-- Mark orphaned cbn_documents as deleted (those not linked to any digital_library_documents)
UPDATE cbn_documents 
SET deleted_at = NOW() 
WHERE id NOT IN (
  SELECT cbn_document_id FROM digital_library_documents WHERE cbn_document_id IS NOT NULL
)
AND deleted_at IS NULL;