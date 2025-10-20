-- Créer les listes système pour la navigation de la Bibliothèque Numérique

-- Liste pour le menu Collections
INSERT INTO system_lists (list_code, list_name, description, module, is_hierarchical, is_active)
VALUES (
  'digital_library_collections',
  'Bibliothèque Numérique - Menu Collections',
  'Entrées du menu Collections de la bibliothèque numérique',
  'digital_library',
  false,
  true
) ON CONFLICT (list_code) DO NOTHING;

-- Liste pour le menu Thèmes
INSERT INTO system_lists (list_code, list_name, description, module, is_hierarchical, is_active)
VALUES (
  'digital_library_themes',
  'Bibliothèque Numérique - Menu Thèmes',
  'Entrées du menu Explorer par thème de la bibliothèque numérique',
  'digital_library',
  false,
  true
) ON CONFLICT (list_code) DO NOTHING;

-- Valeurs pour le menu Collections
INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'books',
  'Livres numériques',
  1,
  true,
  jsonb_build_object(
    'path', '/digital-library/collections/books',
    'icon', 'Book',
    'translations', jsonb_build_object(
      'fr', 'Livres numériques',
      'ar', 'الكتب الرقمية',
      'en', 'Digital Books',
      'ber', 'ⵉⴷⵍⵉⵙⵏ ⵉⵎⴰⵜⵜⴰⵢⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_collections'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'periodicals',
  'Revues et périodiques',
  2,
  true,
  jsonb_build_object(
    'path', '/digital-library/collections/periodicals',
    'icon', 'FileText',
    'translations', jsonb_build_object(
      'fr', 'Revues et périodiques',
      'ar', 'المجلات والدوريات',
      'en', 'Journals and Periodicals',
      'ber', 'ⵜⵉⵎⵥⵍⴰⵢⵉⵏ ⴷ ⵉⴹⵕⵉⵙⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_collections'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'manuscripts',
  'Manuscrits numérisés',
  3,
  true,
  jsonb_build_object(
    'path', '/digital-library/collections/manuscripts',
    'icon', 'BookOpen',
    'translations', jsonb_build_object(
      'fr', 'Manuscrits numérisés',
      'ar', 'المخطوطات الرقمية',
      'en', 'Digitized Manuscripts',
      'ber', 'ⵉⵎⴰⵏⵓⵚⴽⵔⵉⵜⵏ ⵉⵎⴰⵜⵜⴰⵢⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_collections'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'photos',
  'Photographies et cartes',
  4,
  true,
  jsonb_build_object(
    'path', '/digital-library/collections/photos',
    'icon', 'Image',
    'translations', jsonb_build_object(
      'fr', 'Photographies et cartes',
      'ar', 'الصور والخرائط',
      'en', 'Photographs and Maps',
      'ber', 'ⵜⵓⵙⵙⵉⴼⵉⵏ ⴷ ⵜⴽⴰⵕⴹⵉⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_collections'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'audiovisual',
  'Archives sonores et audiovisuelles',
  5,
  true,
  jsonb_build_object(
    'path', '/digital-library/collections/audiovisual',
    'icon', 'Music',
    'translations', jsonb_build_object(
      'fr', 'Archives sonores et audiovisuelles',
      'ar', 'الأرشيف الصوتي والمرئي',
      'en', 'Audio and Audiovisual Archives',
      'ber', 'ⵉⵙⴰⵜⵓⵢⵏ ⵉⵎⵙⵍⵉⵜⵏ ⴷ ⵉⵎⴰⵜⵜⴰⵢⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_collections'
ON CONFLICT DO NOTHING;

-- Valeurs pour le menu Thèmes
INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'history',
  'Histoire & Patrimoine',
  1,
  true,
  jsonb_build_object(
    'path', '/digital-library/themes/history',
    'emoji', '🏛️',
    'translations', jsonb_build_object(
      'fr', 'Histoire & Patrimoine',
      'ar', 'التاريخ والتراث',
      'en', 'History & Heritage',
      'ber', 'ⴰⵎⵣⵔⵓⵢ ⴷ ⵓⵖⵔⵉⵎ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_themes'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'arts',
  'Arts & Culture',
  2,
  true,
  jsonb_build_object(
    'path', '/digital-library/themes/arts',
    'emoji', '🎨',
    'translations', jsonb_build_object(
      'fr', 'Arts & Culture',
      'ar', 'الفنون والثقافة',
      'en', 'Arts & Culture',
      'ber', 'ⵜⵓⵖⴰⵏⵉⵏ ⴷ ⵜⵓⵙⵙⵏⴰ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_themes'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'sciences',
  'Sciences & Techniques',
  3,
  true,
  jsonb_build_object(
    'path', '/digital-library/themes/sciences',
    'emoji', '🔬',
    'translations', jsonb_build_object(
      'fr', 'Sciences & Techniques',
      'ar', 'العلوم والتقنيات',
      'en', 'Science & Technology',
      'ber', 'ⵜⵓⵙⵙⵏⵉⵡⵉⵏ ⴷ ⵜⵉⵜⵉⴽⵏⵉⵇⵉⵏ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_themes'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'religion',
  'Religion & Philosophie',
  4,
  true,
  jsonb_build_object(
    'path', '/digital-library/themes/religion',
    'emoji', '📿',
    'translations', jsonb_build_object(
      'fr', 'Religion & Philosophie',
      'ar', 'الدين والفلسفة',
      'en', 'Religion & Philosophy',
      'ber', 'ⴰⵙⴳⴷ ⴷ ⵜⴼⵍⵙⴰⴼⵜ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_themes'
ON CONFLICT DO NOTHING;

INSERT INTO system_list_values (list_id, value_code, value_label, sort_order, is_active, metadata)
SELECT 
  id,
  'literature',
  'Littérature & Poésie',
  5,
  true,
  jsonb_build_object(
    'path', '/digital-library/themes/literature',
    'emoji', '✍️',
    'translations', jsonb_build_object(
      'fr', 'Littérature & Poésie',
      'ar', 'الأدب والشعر',
      'en', 'Literature & Poetry',
      'ber', 'ⵜⵓⵙⵙⵏⴰ ⴷ ⵓⵎⴷⵢⴰⵣ'
    )
  )
FROM system_lists WHERE list_code = 'digital_library_themes'
ON CONFLICT DO NOTHING;