-- Corriger les demandes approuvées par arbitrage qui ont été incorrectement marquées comme validées par le département ABN
-- Ces demandes doivent être en attente de validation ABN avec la validation du comité remplie

UPDATE legal_deposit_requests 
SET 
  validated_by_committee = validated_by_department,
  committee_validated_at = department_validated_at,
  committee_validation_notes = COALESCE(department_validation_notes, 'Approuvé par arbitrage'),
  validated_by_department = NULL,
  department_validated_at = NULL,
  department_validation_notes = NULL,
  status = 'en_attente_validation_b'
WHERE arbitration_status = 'approved' 
AND validated_by_department IS NOT NULL 
AND validated_by_committee IS NULL;