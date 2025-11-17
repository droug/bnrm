-- Insérer la page CMS pour la bibliothèque numérique
INSERT INTO cms_pages (
  slug, 
  title_fr, 
  title_ar, 
  seo_title_fr, 
  seo_title_ar,
  seo_description_fr, 
  seo_description_ar, 
  status
)
VALUES (
  'bibliotheque-numerique',
  'Bibliothèque Numérique',
  'المكتبة الرقمية',
  'Bibliothèque Numérique - BNRM',
  'المكتبة الرقمية - BNRM',
  'Accédez à plus de 100,000 documents numérisés du patrimoine marocain',
  'الوصول إلى أكثر من 100000 وثيقة رقمية من التراث المغربي',
  'published'
)
ON CONFLICT (slug) DO UPDATE SET
  title_fr = EXCLUDED.title_fr,
  title_ar = EXCLUDED.title_ar,
  seo_title_fr = EXCLUDED.seo_title_fr,
  seo_title_ar = EXCLUDED.seo_title_ar,
  seo_description_fr = EXCLUDED.seo_description_fr,
  seo_description_ar = EXCLUDED.seo_description_ar,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Créer les sections pour la page bibliothèque numérique
DO $$
DECLARE
  v_page_id UUID;
BEGIN
  SELECT id INTO v_page_id FROM cms_pages WHERE slug = 'bibliotheque-numerique';
  
  IF v_page_id IS NULL THEN
    RAISE EXCEPTION 'Page bibliotheque-numerique non trouvée';
  END IF;
  
  -- Supprimer les anciennes sections si elles existent
  DELETE FROM cms_sections WHERE cms_sections.page_id = v_page_id;
  
  -- Section Hero Banner
  INSERT INTO cms_sections (
    page_id, section_type, order_index, is_visible,
    title_fr, title_ar, content_fr, content_ar,
    props
  ) VALUES (
    v_page_id, 'hero', 1, true,
    'Bienvenue à la Bibliothèque Numérique',
    'مرحبا بكم في المكتبة الرقمية',
    'Accédez à plus de 100,000 documents numérisés du patrimoine marocain',
    'الوصول إلى أكثر من 100,000 وثيقة رقمية من التراث المغربي',
    jsonb_build_object(
      'backgroundImage', '/assets/digital-library/library-banner.jpg',
      'height', 'large',
      'overlay', 'dark',
      'alignment', 'center',
      'showSearchBar', true
    )
  );
  
  -- Section Introduction/Texte Riche
  INSERT INTO cms_sections (
    page_id, section_type, order_index, is_visible,
    title_fr, title_ar, content_fr, content_ar,
    props
  ) VALUES (
    v_page_id, 'richtext', 2, true,
    'Notre Collection Numérique',
    'مجموعتنا الرقمية',
    '<p>La Bibliothèque Nationale du Royaume du Maroc met à votre disposition une vaste collection de documents numérisés couvrant plusieurs siècles d''histoire et de culture marocaine. Explorez nos manuscrits, cartes anciennes, photographies historiques et bien plus encore.</p>',
    '<p>تضع المكتبة الوطنية للمملكة المغربية تحت تصرفكم مجموعة واسعة من الوثائق الرقمية التي تغطي عدة قرون من التاريخ والثقافة المغربية. استكشف مخطوطاتنا وخرائطنا القديمة وصورنا التاريخية وأكثر من ذلك بكثير.</p>',
    jsonb_build_object(
      'maxWidth', 'default',
      'alignment', 'center'
    )
  );
  
  -- Section Derniers Ajouts
  INSERT INTO cms_sections (
    page_id, section_type, order_index, is_visible,
    title_fr, title_ar, content_fr, content_ar,
    props
  ) VALUES (
    v_page_id, 'grid', 3, true,
    'Derniers ajouts',
    'الإضافات الأخيرة',
    'Documents récemment ajoutés à nos collections',
    'الوثائق المضافة مؤخرا إلى مجموعاتنا',
    jsonb_build_object(
      'columns', 3,
      'spacing', 'default',
      'dataSource', 'recent_documents',
      'itemsToShow', 6
    )
  );
  
  -- Section Collections en Vedette
  INSERT INTO cms_sections (
    page_id, section_type, order_index, is_visible,
    title_fr, title_ar, content_fr, content_ar,
    props
  ) VALUES (
    v_page_id, 'grid', 4, true,
    'Collections en vedette',
    'المجموعات المميزة',
    'Explorez nos collections thématiques',
    'استكشف مجموعاتنا المواضيعية',
    jsonb_build_object(
      'columns', 4,
      'spacing', 'default',
      'dataSource', 'featured_collections',
      'itemsToShow', 4
    )
  );
  
  -- Section CTA
  INSERT INTO cms_sections (
    page_id, section_type, order_index, is_visible,
    title_fr, title_ar, content_fr, content_ar,
    props
  ) VALUES (
    v_page_id, 'banner', 5, true,
    'Contribuez à notre mission',
    'ساهم في مهمتنا',
    'Rejoignez-nous dans la préservation et la valorisation du patrimoine marocain',
    'انضم إلينا في الحفاظ على التراث المغربي وتثمينه',
    jsonb_build_object(
      'variant', 'info',
      'ctaText', 'En savoir plus',
      'ctaLink', '/digital-library/help'
    )
  );
  
END $$;