-- Modifier la contrainte pour autoriser 'demarrage' comme valeur de décision
ALTER TABLE booking_workflow_history 
DROP CONSTRAINT IF EXISTS booking_workflow_history_decision_check;

ALTER TABLE booking_workflow_history
ADD CONSTRAINT booking_workflow_history_decision_check 
CHECK (decision = ANY (ARRAY['validee'::text, 'refusee'::text, 'verification_en_cours'::text, 'demarrage'::text]));