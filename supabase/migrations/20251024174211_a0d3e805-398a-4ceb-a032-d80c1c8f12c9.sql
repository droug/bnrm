-- Mettre à jour le responsable de la première étape
UPDATE booking_workflow_steps 
SET assigned_role = 'Secrétariat de Direction'
WHERE step_code = 'e01_reception';

-- Vérifier et ajuster les contraintes de statuts pour correspondre au tableau
-- Statuts internes de la table bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN (
  'a_verifier',           -- À vérifier (Soumise)
  'confirmee',            -- Confirmée (Validée)
  'rejetee',              -- Rejetée (Refusée)
  'verification_en_cours', -- Vérification en cours
  'contractualisee',      -- Contractualisée
  'facturee',             -- Facturée
  'en_cours_execution',   -- En cours d'exécution (Mise à disposition)
  'archivee',             -- Archivée (Archivée sans suite)
  'cloturee',             -- Clôturée
  -- Anciens statuts pour compatibilité
  'en_attente',
  'validee',
  'refusee',
  'en_attente_paiement',
  'archivee_sans_suite'
));