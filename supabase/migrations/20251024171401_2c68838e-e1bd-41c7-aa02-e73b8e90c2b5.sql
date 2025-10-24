-- Configure the booking workflow steps with detailed process
-- Clear existing steps first
DELETE FROM booking_workflow_steps;

-- Insert the 5 workflow steps with correct column name
INSERT INTO booking_workflow_steps (step_code, step_name, step_order, assigned_role, description) VALUES
(
  'reception_verification',
  'Réception et vérification',
  1,
  'Direction',
  'Validation initiale par le secrétariat de Direction'
),
(
  'examen_preliminaire',
  'Examen préliminaire',
  2,
  'DAC',
  'Examen préliminaire par la DAC. Si la demande est rejetée par le directeur : Envoi d''une lettre de rejet puis clôture et classement du dossier. Si la demande est approuvée : Vérification des disponibilités. Si non disponibilité : Envoi de la lettre de refus motivée + clôture et classement du dossier. Si disponibilité : Envoi de la lettre de confirmation puis classer l''avis d''émission.'
),
(
  'contractualisation',
  'Contractualisation',
  3,
  'DAC',
  'Présentation du demandeur muni de la confirmation dûment remplie au Département « Activités Culturelles » pour conclusion du contrat. Co-signature du contrat en double exemplaire par le demandeur et le chef du Département « Activités Culturelles ». Remise au Service « Comptabilité» du dossier de la réservation constitué des copies certifiées conformes de la demande, de la lettre de confirmation et du contrat, pour facturation.'
),
(
  'facturation',
  'Facturation',
  4,
  'Service Comptabilité',
  'Etablissement de la facture. Deux cas se présentent : Si le paiement est différé : remettre la facture et préciser au demandeur les délais de paiement + l''obligation de présenter cette facture le jour de l''activité. Si le paiement est non différé : remettre la facture au demandeur en précisant la domiciliation bancaire et le numéro de compte sur lequel le virement (mode unique de paiement) doit être effectué. Seul l''ordre de virement délivré par la banque du demandeur permet l''accès aux espaces et salles. Envoi d''un mail d''information au Service « Bâtiment » afin : de programmer les états des lieux avant mise à disposition des espaces ou salles ; de confirmer le droit d''accès aux espaces ou salles.'
),
(
  'mise_a_disposition',
  'Mise à disposition de la salle ou espace',
  5,
  'Service Bâtiment',
  'Avant le début de l''activité, co-signature d''un état des lieux entrant en double exemplaire par le chef du Service « Bâtiment » et le demandeur. A la fin de l''activité, co-signature d''un état des lieux sortant. Si aucun dégât n''est constaté : un exemplaire d''état des lieux est donné au demandeur portant la mention néant et le deuxième est archivé. Si dégât est constaté : un exemplaire est délivré au demandeur avec la mention du type de dégât et établissement de la fiche de constat. Facturation des dégâts après activité : Transfert des états des lieux et de la fiche de constat associée au Service « Comptabilité » pour facturation.'
);