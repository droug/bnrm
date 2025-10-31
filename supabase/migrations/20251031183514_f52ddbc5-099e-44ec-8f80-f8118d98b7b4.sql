-- ========================================
-- NETTOYAGE ET FUSION DES LISTES SYSTÈME
-- Unifie toutes les listes sous le portail BNRM
-- ========================================

-- 1. Corriger les listes avec platform="Dépôt Légal" vers platform="BNRM"
UPDATE system_lists
SET 
  platform = 'BNRM',
  updated_at = now()
WHERE platform = 'Dépôt Légal'
  AND portal = 'BNRM';

-- 2. Corriger les listes avec platform="Activités Culturelles" vers platform="BNRM"
UPDATE system_lists
SET 
  platform = 'BNRM',
  updated_at = now()
WHERE platform = 'Activités Culturelles'
  AND portal = 'BNRM';

-- 3. Normaliser "Dépôt légal" (avec minuscule) vers "Dépôt Légal"
UPDATE system_lists
SET 
  service = 'Dépôt Légal',
  updated_at = now()
WHERE service = 'Dépôt légal'
  AND portal = 'BNRM';

-- 4. Normaliser les autres variations possibles
UPDATE system_lists
SET 
  service = 'Activités Culturelles',
  updated_at = now()
WHERE service IN ('Activités culturelles', 'activités culturelles')
  AND portal = 'BNRM';

-- 5. Supprimer les doublons potentiels (garder la version la plus récente)
WITH duplicates AS (
  SELECT 
    list_code,
    id,
    ROW_NUMBER() OVER (
      PARTITION BY list_code 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM system_lists
)
DELETE FROM system_lists
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE rn > 1
);

-- 6. Afficher un rapport des changements
SELECT 
  portal,
  platform,
  service,
  COUNT(*) as nombre_listes
FROM system_lists
GROUP BY portal, platform, service
ORDER BY portal, platform, service;