-- Remplacer les images par des salles d'exposition de bibliothèque/musée
-- Salle 1: Galerie d'art avec cadres
UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1594818898109-44704fb548f6?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1594818898109-44704fb548f6?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 1' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

-- Salle 2: Espace d'exposition de manuscrits/musée
UPDATE vexpo_panoramas 
SET 
  panorama_image_url = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=4096&q=80',
  thumbnail_url = 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=400&q=80'
WHERE name_fr = 'Salle 2' 
  AND exhibition_id = '38a6ab6c-1703-45ae-a1b4-47f356796433';

-- Mettre à jour la cover de l'exposition avec une image de bibliothèque
UPDATE vexpo_exhibitions
SET cover_image_url = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80'
WHERE slug = 'demo-expo-360';