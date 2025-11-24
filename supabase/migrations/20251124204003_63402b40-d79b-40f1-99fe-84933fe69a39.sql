-- Ajouter l'image à l'actualité sur la visite de Madame Samira El Malizi
UPDATE cms_actualites 
SET 
  image_url = 'https://www.bnrm.ma/bnrm/images/actualites/samira-el-malizi-turquie-2025.jpg',
  image_alt_fr = 'Madame Samira El Malizi et Monsieur Taner Beyoğlu lors de la visite à la Bibliothèque Nationale de Turquie',
  image_alt_ar = 'السيدة سميرة الملّيزي والسيد تانر بيوغلو خلال الزيارة إلى المكتبة الوطنية التركية',
  updated_at = NOW()
WHERE slug = 'visite-samira-el-malizi-bibliotheque-turquie';