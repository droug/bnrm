-- Ajouter le statut 'en_contrat' à la contrainte de vérification
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status = ANY (ARRAY[
  'a_verifier'::text,
  'confirmee'::text,
  'rejetee'::text,
  'verification_en_cours'::text,
  'contractualisee'::text,
  'en_contrat'::text,
  'facturee'::text,
  'en_cours_execution'::text,
  'archivee'::text,
  'cloturee'::text,
  'en_attente'::text,
  'validee'::text,
  'refusee'::text,
  'en_attente_paiement'::text,
  'archivee_sans_suite'::text
]));