-- Mettre à jour les exemples avec des cotes variées
UPDATE public.reservations_ouvrages
SET document_cote = CASE 
  WHEN document_title LIKE '%littérature%' THEN 'MS001_RBT01'
  WHEN document_title LIKE '%Catalogue%' THEN 'DOC001_CS01'
  WHEN document_title LIKE '%musique%' THEN 'MS003_FES01'
  WHEN document_title LIKE '%Architecture%' THEN 'DOC002_FES02'
  WHEN document_title LIKE '%confidentiels%' THEN 'MS004_RBT02'
  WHEN document_title LIKE '%Poésie%' THEN 'MS005_CS02'
  ELSE document_cote
END
WHERE document_cote IS NOT NULL;