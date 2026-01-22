-- Mettre à jour les panoramas avec des images 360° qui fonctionnent
UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 1' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 2' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

-- S'assurer que les hotspots de navigation ont les bonnes cibles
-- D'abord récupérer les IDs des panoramas
DO $$
DECLARE
  salle1_id UUID;
  salle2_id UUID;
BEGIN
  SELECT id INTO salle1_id FROM vexpo_panoramas WHERE name_fr = 'Salle 1' AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';
  SELECT id INTO salle2_id FROM vexpo_panoramas WHERE name_fr = 'Salle 2' AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';
  
  -- Mettre à jour le hotspot "Aller à la salle 2" pour qu'il pointe vers Salle 2
  UPDATE vexpo_hotspots 
  SET target_panorama_id = salle2_id
  WHERE label_fr LIKE '%salle 2%' AND hotspot_type = 'navigation' AND panorama_id = salle1_id;
  
  -- Mettre à jour le hotspot "Retour salle 1" pour qu'il pointe vers Salle 1
  UPDATE vexpo_hotspots 
  SET target_panorama_id = salle1_id
  WHERE label_fr LIKE '%salle 1%' AND hotspot_type = 'navigation' AND panorama_id = salle2_id;
END $$;

-- Vérifier et corriger les hotspots qui pourraient être inactifs
UPDATE vexpo_hotspots 
SET is_active = true
WHERE panorama_id IN (
  SELECT id FROM vexpo_panoramas 
  WHERE exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433'
);