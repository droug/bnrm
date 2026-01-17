DO $$
DECLARE
  demo_exhibition_id uuid := gen_random_uuid();
  pano1_id uuid := gen_random_uuid();
  pano2_id uuid := gen_random_uuid();
  artwork_id uuid := gen_random_uuid();
  pano1_url text := 'https://threejs.org/examples/textures/equirectangular/pisa.jpg';
  pano2_url text := 'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.jpg';
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.vexpo_exhibitions WHERE slug = 'demo-expo-360'
  ) THEN
    INSERT INTO public.vexpo_exhibitions (
      id, slug, status, title_fr, title_ar, teaser_fr, teaser_ar, intro_fr, intro_ar,
      cover_image_url, primary_button_label_fr, primary_button_label_ar,
      start_date, end_date, created_at, updated_at
    ) VALUES (
      demo_exhibition_id,
      'demo-expo-360',
      'published'::public.vexpo_status,
      'Démo — Visite virtuelle 360°',
      'عرض تجريبي — جولة افتراضية 360°',
      'Exposition de démonstration avec hotspots (texte, œuvre, média, navigation).',
      'معرض تجريبي مع نقاط تفاعلية (نص، عمل، وسائط، تنقل).',
      'Cliquez sur les points dans le panorama pour ouvrir un texte, une œuvre, un média, ou naviguer entre les salles.',
      'انقر على النقاط داخل البانوراما لفتح نص أو عمل أو وسائط أو للتنقل بين القاعات.',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80',
      'Commencer la visite',
      'ابدأ الجولة',
      now() - interval '1 day',
      now() + interval '30 days',
      now(), now()
    );

    INSERT INTO public.vexpo_artworks (
      id, title_fr, title_ar, description_fr, description_ar,
      creator_author, creation_date, artwork_type, inventory_id,
      keywords, images, external_catalog_url, is_active, created_at, updated_at
    ) VALUES (
      artwork_id,
      'Manuscrit enluminé (démo)',
      'مخطوط مزخرف (تجريبي)',
      E'Exemple d\'œuvre liée à un hotspot. Vous pouvez remplacer ces données par vos notices réelles.',
      'مثال لعمل مرتبط بنقطة تفاعلية. يمكنك استبدال هذه البيانات ببياناتك الحقيقية.',
      'Auteur inconnu',
      'XIVe siècle',
      'manuscript',
      'DEMO-001',
      ARRAY['démo','manuscrit','patrimoine'],
      jsonb_build_array(jsonb_build_object('url','https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=1400&q=80','alt','Manuscrit (démo)')),
      'https://bnrm.lovable.app/digital-library',
      true, now(), now()
    );

    INSERT INTO public.vexpo_panoramas (
      id, exhibition_id, name_fr, name_ar, display_order, panorama_image_url, is_active, created_at, updated_at
    ) VALUES
      (pano1_id, demo_exhibition_id, 'Salle 1', 'القاعة 1', 1, pano1_url, true, now(), now()),
      (pano2_id, demo_exhibition_id, 'Salle 2', 'القاعة 2', 2, pano2_url, true, now(), now());

    INSERT INTO public.vexpo_hotspots (
      id, panorama_id, hotspot_type, yaw, pitch, label_fr, label_ar,
      rich_text_fr, rich_text_ar, artwork_id, media_url, media_type,
      target_panorama_id, display_order, is_active, created_at, updated_at
    ) VALUES
      (gen_random_uuid(), pano1_id, 'text'::public.vexpo_hotspot_type, 20, 0,
       'Texte', 'نص',
       E'<p><strong>Hotspot texte</strong> — contenu HTML (démo).</p><p>Vous pouvez créer ce type de hotspot depuis l\'éditeur.</p>',
       '<p><strong>نقطة نصية</strong> — محتوى HTML (تجريبي).</p>',
       null, null, null, null, 1, true, now(), now()),
      (gen_random_uuid(), pano1_id, 'artwork'::public.vexpo_hotspot_type, -40, -10,
       'Œuvre', 'عمل', null, null, artwork_id, null, null, null, 2, true, now(), now()),
      (gen_random_uuid(), pano1_id, 'media'::public.vexpo_hotspot_type, 80, 5,
       'Vidéo', 'فيديو',
       '<p>Exemple vidéo intégrée (YouTube).</p>',
       '<p>مثال فيديو مدمج (يوتيوب).</p>',
       null, 'https://www.youtube-nocookie.com/embed/ysz5S6PUM-U', 'video', null, 3, true, now(), now()),
      (gen_random_uuid(), pano1_id, 'navigation'::public.vexpo_hotspot_type, 150, 0,
       'Aller à la salle 2', 'اذهب إلى القاعة 2',
       null, null, null, null, null, pano2_id, 4, true, now(), now()),
      (gen_random_uuid(), pano2_id, 'navigation'::public.vexpo_hotspot_type, -150, 0,
       'Retour à la salle 1', 'العودة إلى القاعة 1',
       null, null, null, null, null, pano1_id, 1, true, now(), now());
  END IF;
END $$;