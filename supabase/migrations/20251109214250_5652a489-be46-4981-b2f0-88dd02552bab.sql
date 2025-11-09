-- Ajouter la colonne legal_representative et supprimer institution_code
ALTER TABLE partner_collections 
ADD COLUMN IF NOT EXISTS legal_representative TEXT;

-- Supprimer la colonne institution_code si elle existe
ALTER TABLE partner_collections 
DROP COLUMN IF EXISTS institution_code;