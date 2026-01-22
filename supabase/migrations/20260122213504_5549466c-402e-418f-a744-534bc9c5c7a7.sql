-- Ajouter des hotspots de type "artwork" liés aux œuvres existantes
-- Salle 1 (91814379-04ff-4dfc-b4ba-46161e86c107): Manuscrit enluminé et Carte ancienne
INSERT INTO vexpo_hotspots (
  panorama_id, hotspot_type, yaw, pitch, 
  label_fr, label_ar, 
  artwork_id,
  icon_name, icon_color, icon_size,
  is_active, display_order
) VALUES 
(
  '91814379-04ff-4dfc-b4ba-46161e86c107', 
  'artwork', 
  -30, 5,
  'Manuscrit enluminé (XIVe siècle)',
  'مخطوط مزخرف (القرن الرابع عشر)',
  'cf3b5092-70c0-410a-b092-26f160ff7526',
  'image', '#F59E0B', 32,
  true, 10
),
(
  '91814379-04ff-4dfc-b4ba-46161e86c107', 
  'artwork', 
  30, 0,
  'Carte ancienne du Maroc',
  'خريطة قديمة للمغرب',
  'f5749fc7-aa5a-49a7-a9ff-d4a1eedb1617',
  'map', '#F59E0B', 32,
  true, 11
);

-- Salle 2 (2dadb049-3a52-4046-9453-b4d285e25b24): Photographie historique et Calligraphie
INSERT INTO vexpo_hotspots (
  panorama_id, hotspot_type, yaw, pitch, 
  label_fr, label_ar, 
  artwork_id,
  icon_name, icon_color, icon_size,
  is_active, display_order
) VALUES 
(
  '2dadb049-3a52-4046-9453-b4d285e25b24', 
  'artwork', 
  -45, 10,
  'Photographie historique - Fès',
  'صورة تاريخية - فاس',
  'e53930a8-9de0-475b-9ca4-b68cac328eb2',
  'camera', '#F59E0B', 32,
  true, 10
),
(
  '2dadb049-3a52-4046-9453-b4d285e25b24', 
  'artwork', 
  90, 5,
  'Calligraphie arabe',
  'الخط العربي',
  'ef760b47-4ecb-4e5a-906e-52687265bc88',
  'pen-tool', '#F59E0B', 32,
  true, 11
);