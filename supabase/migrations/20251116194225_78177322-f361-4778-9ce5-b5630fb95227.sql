-- Update service categories to properly classify subscriptions vs on-demand services
-- Inscriptions are subscriptions (abonnements)
UPDATE bnrm_services 
SET categorie = 'Abonnement'
WHERE categorie = 'Inscription' 
  AND nom_service IN (
    'Inscription Étudiants', 
    'Inscription Grand Public', 
    'Pass Jeunes', 
    'Inscription Chercheurs professionnels',
    'Inscription Étudiants/chercheurs',
    'Duplicata de carte d''inscription'
  );

-- Location services should be "Service à la demande"
UPDATE bnrm_services 
SET categorie = 'Service à la demande'
WHERE categorie = 'Location';

-- Reproduction services should be "Service à la demande"  
UPDATE bnrm_services 
SET categorie = 'Service à la demande'
WHERE categorie = 'Reproduction';

-- Formation services should be "Service à la demande"
UPDATE bnrm_services 
SET categorie = 'Service à la demande'
WHERE categorie = 'Formation';