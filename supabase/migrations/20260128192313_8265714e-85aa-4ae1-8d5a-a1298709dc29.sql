-- Nettoyer les documents orphelins dans cbn_documents
-- Ces documents n'ont pas de lien vers digital_library_documents et ne devraient pas apparaître dans la recherche

UPDATE cbn_documents
SET deleted_at = NOW()
WHERE digital_library_document_id IS NULL 
AND deleted_at IS NULL;