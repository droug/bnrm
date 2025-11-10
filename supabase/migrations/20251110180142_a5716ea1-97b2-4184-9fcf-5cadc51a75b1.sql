-- Migration pour modifier le champ nom_organisme en enum
-- et ajouter nom_organisme_autre pour la table partnerships

-- Étape 1: Ajouter la nouvelle colonne nom_organisme_autre
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS nom_organisme_autre text;

-- Étape 2: Migrer les données existantes
-- Copier le nom_organisme actuel dans nom_organisme_autre et définir nom_organisme à 'autre'
UPDATE partnerships
SET nom_organisme_autre = nom_organisme,
    nom_organisme = 'autre'
WHERE nom_organisme NOT IN ('institution', 'organisme', 'zaouia', 'autre');

-- Étape 3: Ajouter la contrainte check pour l'enum
ALTER TABLE partnerships
ADD CONSTRAINT partnerships_nom_organisme_check 
CHECK (nom_organisme IN ('institution', 'organisme', 'zaouia', 'autre'));

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN partnerships.nom_organisme IS 'Type d''entité: institution, organisme, zaouia, ou autre';
COMMENT ON COLUMN partnerships.nom_organisme_autre IS 'Précision du nom si autre est sélectionné';