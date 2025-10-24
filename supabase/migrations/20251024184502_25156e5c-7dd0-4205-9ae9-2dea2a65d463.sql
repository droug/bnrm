-- Supprimer complètement la contrainte actuelle
ALTER TABLE booking_workflow_history DROP CONSTRAINT IF EXISTS booking_workflow_history_decision_check;

-- Recréer la contrainte avec toutes les valeurs nécessaires
ALTER TABLE booking_workflow_history ADD CONSTRAINT booking_workflow_history_decision_check 
CHECK (decision IN (
  'demarrage',
  'validee',
  'refusee',
  'verification_en_cours',
  'confirmee',
  'contractualisee',
  'en_contrat',
  'facturee',
  'mise_a_disposition',
  'facture_complementaire',
  'degats_constates',
  'cloturee',
  'archivee_sans_suite'
));