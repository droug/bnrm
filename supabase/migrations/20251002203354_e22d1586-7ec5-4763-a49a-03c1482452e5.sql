-- Insert fictional manuscripts for reproduction testing
INSERT INTO public.manuscripts (title, author, description, period, language, collection_id, access_level, status, inventory_number, thumbnail_url) VALUES
('مخطوط الفقه المالكي', 'الإمام مالك بن أنس', 'مخطوط نادر في الفقه المالكي يعود للقرن الثاني عشر الهجري', 'القرن 12 هـ', 'ar', NULL, 'public', 'available', 'MS-2024-001', '/placeholder.svg'),
('Histoire du Maroc', 'Ahmed Ibn Khaled', 'Manuscrit historique détaillant les dynasties marocaines', 'XVIIIe siècle', 'fr', NULL, 'public', 'available', 'MS-2024-002', '/placeholder.svg'),
('ديوان الشعر الأندلسي', 'ابن زيدون', 'مجموعة شعرية من العصر الأندلسي', 'القرن 11 هـ', 'ar', NULL, 'restricted', 'available', 'MS-2024-003', '/placeholder.svg'),
('Traité de Médecine Traditionnelle', 'Ibn Sina (Avicenne)', 'Manuscrit médical avec illustrations', 'XIe siècle', 'ar', NULL, 'public', 'available', 'MS-2024-004', '/placeholder.svg'),
('المعجم الجغرافي للمغرب', 'الحسن الوزان', 'وصف جغرافي شامل للمغرب وشمال إفريقيا', 'القرن 10 هـ', 'ar', NULL, 'public', 'available', 'MS-2024-005', '/placeholder.svg');

-- Insert fictional content/pages for reproduction testing
INSERT INTO public.content (title, content_type, status, author_id, slug, content_body, excerpt, published_at, is_featured) 
SELECT 
  'Archives Photographiques du Maroc Colonial',
  'page',
  'published',
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'archives-photos-maroc-colonial',
  'Collection de photographies historiques du Maroc pendant la période coloniale avec plus de 500 images numérisées en haute résolution.',
  'Plus de 500 photographies numérisées',
  NOW(),
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.content (title, content_type, status, author_id, slug, content_body, excerpt, published_at, is_featured)
SELECT
  'Collection de Cartes Anciennes',
  'page',
  'published',
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'cartes-anciennes-maroc',
  'Cartes géographiques du Maroc du XVIe au XXe siècle, incluant des atlas historiques et cartes topographiques détaillées.',
  'Atlas historiques et cartes topographiques',
  NOW(),
  false
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.content (title, content_type, status, author_id, slug, content_body, excerpt, published_at, is_featured)
SELECT
  'Documents Administratifs Historiques',
  'page',
  'published',
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'documents-administratifs-historiques',
  'Archives administratives des institutions marocaines incluant registres, décrets et correspondances officielles du XIXe et XXe siècles.',
  'Registres, décrets et correspondances officielles',
  NOW(),
  false
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');