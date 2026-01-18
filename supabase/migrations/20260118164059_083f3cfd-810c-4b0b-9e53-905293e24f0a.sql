-- Mise à jour du contenu Hero pour le portail BNRM
UPDATE cms_hero_settings 
SET 
  hero_title_fr = 'Bienvenue à la Bibliothèque Nationale du Royaume du Maroc',
  hero_title_ar = 'مرحباً بكم في المكتبة الوطنية للمملكة المغربية',
  hero_subtitle_fr = 'Découvrez notre patrimoine documentaire et culturel',
  hero_subtitle_ar = 'اكتشفوا تراثنا الوثائقي والثقافي',
  hero_cta_label_fr = 'Nos services',
  hero_cta_label_ar = 'خدماتنا',
  hero_cta_url = '/services',
  hero_secondary_cta_label_fr = 'Informations pratiques',
  hero_secondary_cta_label_ar = 'معلومات عملية',
  hero_secondary_cta_url = '/informations-pratiques',
  updated_at = now()
WHERE platform = 'portal';

-- Mise à jour du contenu Hero pour la BN (Bibliothèque Numérique)
UPDATE cms_hero_settings 
SET 
  hero_title_fr = 'Bibliothèque Numérique Ibn Battuta',
  hero_title_ar = 'مكتبة ابن بطوطة الرقمية',
  hero_subtitle_fr = 'Explorez notre patrimoine numérisé : manuscrits, livres rares et archives',
  hero_subtitle_ar = 'اكتشفوا تراثنا الرقمي: مخطوطات، كتب نادرة وأرشيفات',
  hero_cta_label_fr = 'Explorer les collections',
  hero_cta_label_ar = 'استكشاف المجموعات',
  hero_cta_url = '/digital-library/collections',
  hero_secondary_cta_label_fr = 'Visionneuse de manuscrits',
  hero_secondary_cta_label_ar = 'عارض المخطوطات',
  hero_secondary_cta_url = '/digital-library/manuscripts',
  updated_at = now()
WHERE platform = 'bn';