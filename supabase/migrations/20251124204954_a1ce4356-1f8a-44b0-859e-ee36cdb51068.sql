-- Mettre à jour l'image pour l'article de la directrice Samira El Malizi
UPDATE cms_actualites
SET 
  image_url = '/images/news/samira-el-malizi-turquie.jpg',
  updated_at = NOW()
WHERE slug = 'visite-samira-el-malizi-bibliotheque-turquie';