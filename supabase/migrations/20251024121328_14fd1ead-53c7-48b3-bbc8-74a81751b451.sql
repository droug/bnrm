-- Ajouter le statut "archivee" à la contrainte de vérification
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN (
  'en_attente',
  'en_attente_validation',
  'verification_en_cours',
  'confirmée',
  'en_contrat',
  'validee',
  'rejetee',
  'annulee',
  'terminée',
  'archivee'
));