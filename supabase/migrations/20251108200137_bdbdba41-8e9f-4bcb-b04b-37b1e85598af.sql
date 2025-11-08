-- Rendre le champ tutelle optionnel dans les tables d'adhésion
ALTER TABLE cbm_adhesions_catalogue 
ALTER COLUMN tutelle DROP NOT NULL;

ALTER TABLE cbm_adhesions_reseau 
ALTER COLUMN tutelle DROP NOT NULL;