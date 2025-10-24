-- Supprimer les anciennes étapes de workflow
DELETE FROM booking_workflow_steps;

-- Créer les 8 nouvelles étapes du workflow
INSERT INTO booking_workflow_steps (step_code, step_name, step_order, assigned_role, description) VALUES
('e01_reception', 'Réception et validation initiale', 1, 'Direction', 'Le demandeur soumet sa demande. Transmission automatique au Directeur et copie au DAC.'),
('e02_decision_direction', 'Décision de la Direction', 2, 'Direction', 'Le Directeur examine et décide: Approuvée, Refusée, ou Vérification en cours (cas sensible).'),
('e03_traitement_dac', 'Traitement par le DAC', 3, 'DAC', 'Réception du dossier validé. Envoi lettre de confirmation/refus. Confirmation de disponibilité.'),
('e04_contractualisation', 'Contractualisation', 4, 'DAC', 'Signature du contrat par le demandeur et le Chef DAC. Transmission au Service Comptabilité.'),
('e05_facturation', 'Facturation', 5, 'Service Comptabilité', 'Émission de la facture selon le mode de paiement. Notification au demandeur.'),
('e06_mise_a_disposition', 'Mise à disposition', 6, 'Service Bâtiment', 'Programmation, états des lieux entrant/sortant. Constat de dégâts si nécessaire.'),
('e07_facturation_complementaire', 'Facturation complémentaire', 7, 'Service Comptabilité', 'Émission facture complémentaire en cas de dégâts constatés.'),
('e08_cloture', 'Clôture / Archivage', 8, 'DAC', 'Archivage automatique du dossier. Archivage sans suite après 60j si vérification en cours.');

-- Mettre à jour la contrainte des statuts de bookings pour inclure tous les nouveaux statuts
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN (
  'en_attente',           -- Soumise
  'a_verifier',           -- À vérifier
  'validee',              -- Validée/Acceptée
  'refusee',              -- Refusée
  'verification_en_cours', -- Vérification en cours (cas sensible)
  'confirmee',            -- Confirmée (après validation Direction)
  'contractualisee',      -- Contractualisée
  'facturee',             -- Facturée
  'en_attente_paiement',  -- En attente de paiement
  'en_cours_execution',   -- Mise à disposition en cours
  'archivee_sans_suite',  -- Archivée sans suite (après 60j)
  'cloturee'              -- Clôturée (terminée)
));

-- Mettre à jour la contrainte des décisions dans l'historique
ALTER TABLE booking_workflow_history DROP CONSTRAINT IF EXISTS booking_workflow_history_decision_check;
ALTER TABLE booking_workflow_history ADD CONSTRAINT booking_workflow_history_decision_check 
CHECK (decision IN (
  'demarrage',
  'validee',
  'refusee',
  'verification_en_cours',
  'confirmee',
  'contractualisee',
  'facturee',
  'mise_a_disposition',
  'facture_complementaire',
  'cloturee',
  'archivee_sans_suite'
));