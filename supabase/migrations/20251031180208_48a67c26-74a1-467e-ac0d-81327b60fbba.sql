-- Ajouter des colonnes de hiérarchie aux listes système
ALTER TABLE system_lists 
ADD COLUMN IF NOT EXISTS portal TEXT,
ADD COLUMN IF NOT EXISTS platform TEXT,
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS sub_service TEXT;

-- Créer un index pour améliorer les performances des filtres
CREATE INDEX IF NOT EXISTS idx_system_lists_hierarchy 
ON system_lists(portal, platform, service, sub_service, module, form_name);

-- Mettre à jour les listes existantes avec la hiérarchie par défaut
UPDATE system_lists
SET 
  portal = 'BNRM',
  platform = CASE 
    WHEN module LIKE '%Dépôt Légal%' THEN 'Dépôt Légal'
    WHEN module LIKE '%Activités Culturelles%' THEN 'Activités Culturelles'
    WHEN module LIKE '%CBM%' THEN 'CBM'
    WHEN module LIKE '%Bibliothèque Numérique%' THEN 'Bibliothèque Numérique'
    WHEN module LIKE '%Manuscrits%' THEN 'Manuscrits'
    WHEN module LIKE '%Reproduction%' THEN 'Reproduction'
    ELSE 'BNRM'
  END,
  service = module,
  sub_service = form_name
WHERE portal IS NULL;