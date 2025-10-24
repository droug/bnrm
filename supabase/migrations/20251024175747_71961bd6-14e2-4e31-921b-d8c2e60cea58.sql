-- Migration pour mettre à jour les codes d'étapes existants vers les nouveaux codes
-- Mapper les anciens codes vers les nouveaux codes du workflow

-- Mise à jour de la table bookings
UPDATE bookings
SET current_step_code = CASE
  WHEN current_step_code = 'reception_verification' THEN 'e01_reception'
  WHEN current_step_code = 'examen_preliminaire' THEN 'e02_decision_direction'
  WHEN current_step_code = 'traitement_dac' THEN 'e03_traitement_dac'
  WHEN current_step_code = 'contractualisation' THEN 'e04_contractualisation'
  WHEN current_step_code = 'facturation' THEN 'e05_facturation'
  WHEN current_step_code = 'mise_a_disposition' THEN 'e06_mise_a_disposition'
  WHEN current_step_code = 'facturation_complementaire' THEN 'e07_facturation_complementaire'
  WHEN current_step_code = 'cloture' THEN 'e08_cloture'
  ELSE current_step_code
END
WHERE current_step_code IN (
  'reception_verification',
  'examen_preliminaire',
  'traitement_dac',
  'contractualisation',
  'facturation',
  'mise_a_disposition',
  'facturation_complementaire',
  'cloture'
);

-- Mise à jour de la table booking_workflow_history
UPDATE booking_workflow_history
SET step_code = CASE
  WHEN step_code = 'reception_verification' THEN 'e01_reception'
  WHEN step_code = 'examen_preliminaire' THEN 'e02_decision_direction'
  WHEN step_code = 'traitement_dac' THEN 'e03_traitement_dac'
  WHEN step_code = 'contractualisation' THEN 'e04_contractualisation'
  WHEN step_code = 'facturation' THEN 'e05_facturation'
  WHEN step_code = 'mise_a_disposition' THEN 'e06_mise_a_disposition'
  WHEN step_code = 'facturation_complementaire' THEN 'e07_facturation_complementaire'
  WHEN step_code = 'cloture' THEN 'e08_cloture'
  ELSE step_code
END
WHERE step_code IN (
  'reception_verification',
  'examen_preliminaire',
  'traitement_dac',
  'contractualisation',
  'facturation',
  'mise_a_disposition',
  'facturation_complementaire',
  'cloture'
);