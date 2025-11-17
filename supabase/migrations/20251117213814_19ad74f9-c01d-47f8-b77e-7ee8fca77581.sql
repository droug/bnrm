-- Migration: Importer les pages existantes dans le CMS
-- Créer les pages principales du site dans cms_pages

INSERT INTO cms_pages (slug, title_fr, title_ar, seo_title_fr, seo_title_ar, seo_description_fr, seo_description_ar, status)
VALUES 
  -- Page d'accueil
  (
    'accueil',
    'Accueil',
    'الصفحة الرئيسية',
    'Bibliothèque Nationale du Royaume du Maroc - Accueil',
    'المكتبة الوطنية للمملكة المغربية - الصفحة الرئيسية',
    'Portail officiel de la Bibliothèque Nationale du Royaume du Maroc. Accédez à notre catalogue, bibliothèque numérique, manuscrits et services.',
    'البوابة الرسمية للمكتبة الوطنية للمملكة المغربية. الوصول إلى الكتالوج والمكتبة الرقمية والمخطوطات والخدمات.',
    'published'
  ),
  
  -- À propos
  (
    'a-propos',
    'À propos',
    'حول',
    'À propos de la BNRM',
    'حول المكتبة الوطنية',
    'Découvrez l''histoire, la mission et les valeurs de la Bibliothèque Nationale du Royaume du Maroc.',
    'اكتشف تاريخ ورسالة وقيم المكتبة الوطنية للمملكة المغربية.',
    'published'
  ),
  
  -- Services
  (
    'services',
    'Services',
    'الخدمات',
    'Services de la BNRM',
    'خدمات المكتبة الوطنية',
    'Explorez tous les services offerts par la Bibliothèque Nationale : consultation, prêt, reproduction, formations.',
    'اكتشف جميع الخدمات التي تقدمها المكتبة الوطنية: الاستشارة والإعارة والنسخ والتدريب.',
    'published'
  ),
  
  -- Bibliothèque numérique
  (
    'bibliotheque-numerique',
    'Bibliothèque numérique',
    'المكتبة الرقمية',
    'Bibliothèque numérique de la BNRM',
    'المكتبة الرقمية للمكتبة الوطنية',
    'Accédez à notre collection numérisée de documents, manuscrits et archives historiques.',
    'الوصول إلى مجموعتنا الرقمية من الوثائق والمخطوطات والأرشيف التاريخي.',
    'published'
  ),
  
  -- Actualités
  (
    'actualites',
    'Actualités',
    'الأخبار',
    'Actualités de la BNRM',
    'أخبار المكتبة الوطنية',
    'Suivez les dernières actualités, événements et annonces de la Bibliothèque Nationale.',
    'تابع آخر الأخبار والأحداث والإعلانات من المكتبة الوطنية.',
    'published'
  ),
  
  -- Contact
  (
    'contact',
    'Contact',
    'اتصل',
    'Contactez la BNRM',
    'اتصل بالمكتبة الوطنية',
    'Contactez la Bibliothèque Nationale du Royaume du Maroc. Horaires, adresse et formulaire de contact.',
    'اتصل بالمكتبة الوطنية للمملكة المغربية. ساعات العمل والعنوان ونموذج الاتصال.',
    'published'
  ),
  
  -- Informations pratiques
  (
    'informations-pratiques',
    'Informations pratiques',
    'معلومات عملية',
    'Informations pratiques - BNRM',
    'معلومات عملية - المكتبة الوطنية',
    'Horaires d''ouverture, accès, règlement intérieur et informations pratiques pour visiter la bibliothèque.',
    'ساعات العمل والوصول واللوائح الداخلية والمعلومات العملية لزيارة المكتبة.',
    'published'
  ),
  
  -- Aide
  (
    'aide',
    'Aide',
    'مساعدة',
    'Aide et support - BNRM',
    'المساعدة والدعم - المكتبة الوطنية',
    'Centre d''aide et guides d''utilisation des services de la Bibliothèque Nationale.',
    'مركز المساعدة وأدلة استخدام خدمات المكتبة الوطنية.',
    'published'
  )
ON CONFLICT (slug) DO UPDATE SET
  title_fr = EXCLUDED.title_fr,
  title_ar = EXCLUDED.title_ar,
  seo_title_fr = EXCLUDED.seo_title_fr,
  seo_title_ar = EXCLUDED.seo_title_ar,
  seo_description_fr = EXCLUDED.seo_description_fr,
  seo_description_ar = EXCLUDED.seo_description_ar,
  updated_at = now();

COMMENT ON TABLE cms_pages IS 'Gestion centralisée de toutes les pages du site via le CMS';