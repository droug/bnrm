-- Mettre à jour les réservations avec des exemples de cotes
UPDATE public.reservations_ouvrages
SET document_cote = CASE 
  WHEN document_id = 'd9438de4-d465-470a-af9d-0638b01fd3cc' THEN 'MS001_RBT01'
  WHEN document_id = 'e8539ef5-e576-571b-bf0e-1739c02fe4dd' THEN 'DOC001_CS01'
  WHEN document_id = 'f9640fg6-f687-682c-cg1f-2840d03gf5ee' THEN 'PHOTO001_FES01'
  ELSE 'MS002_RBT02'
END
WHERE document_cote IS NULL OR document_cote = '';