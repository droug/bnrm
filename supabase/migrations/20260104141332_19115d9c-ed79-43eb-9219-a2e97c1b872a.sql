-- Mise à jour des métadonnées du document avec les informations du catalogue BNRM (notice b1121115)
UPDATE digital_library_documents 
SET 
  title = 'Contes et Poèmes d''Islam',
  author = 'Salem El Koubi',
  publication_year = 1917,
  language = 'fr',
  document_type = 'book',
  updated_at = now()
WHERE id = '6135d8a8-43c3-446f-8484-39c88f517978';