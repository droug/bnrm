-- Mettre à jour les panoramas avec des vraies images de galeries d'art
-- Salle 1: Couloir de musée avec tableaux
UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 1' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

-- Salle 2: Galerie d'art avec sculptures et plafond vitré
UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 2' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

-- Mettre à jour la cover avec une image de musée
UPDATE vexpo_exhibitions
SET cover_image_url = 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1600&q=80'
WHERE slug = 'demo-expo-360';