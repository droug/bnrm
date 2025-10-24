-- Remettre tous les statuts des réservations à "en_attente"
UPDATE bookings 
SET 
  status = 'en_attente',
  rejection_reason = NULL,
  admin_notes = NULL,
  reviewed_at = NULL
WHERE status IN ('validee', 'rejetee', 'verification_en_cours', 'archivee');