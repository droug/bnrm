-- Importer les médias existants de la bibliothèque numérique dans le CMS
INSERT INTO cms_media (
  file_name,
  file_url,
  file_type,
  title_fr,
  title_ar,
  alt_fr,
  alt_ar,
  description_fr,
  tags,
  file_size_kb
) VALUES
  -- Image hero principale
  (
    'digital-library-hero.jpg',
    '/src/assets/digital-library-hero.jpg',
    'image',
    'Bibliothèque Numérique - Image Hero',
    'المكتبة الرقمية - صورة رئيسية',
    'Vue panoramique de la bibliothèque numérique',
    'منظر بانورامي للمكتبة الرقمية',
    'Image principale de la page d''accueil de la bibliothèque numérique',
    ARRAY['bibliothèque', 'numérique', 'hero', 'patrimoine'],
    150
  ),
  -- Archives photographiques
  (
    'archives-photo-maroc.jpg',
    '/src/assets/digital-library/archives-photo-maroc.jpg',
    'image',
    'Archives Photographiques du Maroc Colonial',
    'أرشيف صور المغرب الاستعماري',
    'Collection de photographies historiques du Maroc colonial',
    'مجموعة صور تاريخية من المغرب الاستعماري',
    'Archives photographiques documentant l''histoire du Maroc pendant la période coloniale',
    ARRAY['archives', 'photographie', 'maroc', 'colonial', 'histoire'],
    200
  ),
  -- Cartes anciennes
  (
    'cartes-anciennes.jpg',
    '/src/assets/digital-library/cartes-anciennes.jpg',
    'image',
    'Collection de Cartes Anciennes',
    'مجموعة الخرائط القديمة',
    'Cartes historiques et géographiques du Maroc',
    'خرائط تاريخية وجغرافية للمغرب',
    'Collection rare de cartes anciennes montrant l''évolution géographique du Maroc',
    ARRAY['cartes', 'géographie', 'histoire', 'ancien'],
    180
  ),
  -- Logiciel patrimoine
  (
    'logiciel-patrimoine.jpg',
    '/src/assets/digital-library/logiciel-patrimoine.jpg',
    'image',
    'Logiciel Patrimoine',
    'برنامج التراث',
    'Interface du logiciel de gestion du patrimoine',
    'واجهة برنامج إدارة التراث',
    'Capture d''écran du système de gestion et catalogage du patrimoine documentaire',
    ARRAY['logiciel', 'patrimoine', 'technologie', 'gestion'],
    120
  ),
  -- Manuscrits andalous
  (
    'manuscrits-andalous.jpg',
    '/src/assets/digital-library/manuscrits-andalous.jpg',
    'image',
    'Manuscrits Andalous',
    'المخطوطات الأندلسية',
    'Collection de manuscrits de l''époque andalouse',
    'مجموعة مخطوطات من العصر الأندلسي',
    'Manuscrits précieux de la civilisation andalouse, témoins de l''âge d''or islamique',
    ARRAY['manuscrits', 'andalous', 'islam', 'histoire', 'calligraphie'],
    250
  ),
  -- Documents administratifs
  (
    'documents-administratifs.jpg',
    '/src/assets/digital-library/documents-administratifs.jpg',
    'image',
    'Documents Administratifs Historiques',
    'الوثائق الإدارية التاريخية',
    'Archives de documents administratifs officiels',
    'أرشيف الوثائق الإدارية الرسمية',
    'Collection de documents administratifs et décrets historiques du Maroc',
    ARRAY['administratif', 'documents', 'officiel', 'archives'],
    160
  );

COMMENT ON TABLE cms_media IS 'Bibliothèque centralisée de tous les médias utilisés sur le site (images, vidéos, documents)';