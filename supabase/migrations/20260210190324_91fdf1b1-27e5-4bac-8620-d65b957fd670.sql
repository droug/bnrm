
-- Drop the existing constraint and recreate with additional types
ALTER TABLE cms_sections DROP CONSTRAINT cms_sections_section_type_check;
ALTER TABLE cms_sections ADD CONSTRAINT cms_sections_section_type_check 
  CHECK (section_type = ANY (ARRAY['hero', 'richtext', 'grid', 'cardList', 'banner', 'faq', 'eventList', 'image', 'video', 'callout', 'statBlocks', 'cards', 'stats', 'custom', 'carousel', 'timeline']));

-- Delete old outdated BN sections
DELETE FROM cms_sections WHERE page_id = 'dafc8f22-60aa-48de-a4bb-2611cc8d8893';

-- Insert updated sections matching the real BN homepage
INSERT INTO cms_sections (page_id, section_type, title_fr, title_ar, content_fr, content_ar, order_index, is_visible, props) VALUES
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'hero', 'Hero BN', 'الشعار الرئيسي', 'Section Hero avec image de fond, barre de recherche et titre principal', 'قسم البطل مع صورة خلفية وشريط بحث', 1, true, '{"cms_tab": "hero", "admin_route": "/admin/content-management-BN", "description": "Géré via l''onglet Hero BN du CMS"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'carousel', 'Œuvres Vedettes', 'الأعمال المميزة', 'Carrousel des œuvres mises en avant sur la page d''accueil', 'عرض دوار للأعمال المميزة في الصفحة الرئيسية', 2, true, '{"cms_tab": "carrousel-bn", "admin_route": "/admin/content-management-BN", "description": "Géré via l''onglet Œuvres Vedettes du CMS"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'grid', 'Derniers Ajouts', 'آخر الإضافات', 'Grille des derniers documents ajoutés à la bibliothèque numérique', 'شبكة آخر الوثائق المضافة إلى المكتبة الرقمية', 3, true, '{"cms_tab": null, "admin_route": "/admin/digital-library/documents", "description": "Alimenté automatiquement depuis les documents publiés"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'stats', 'Ibn Battouta en chiffres', 'ابن بطوطة في أرقام', 'Statistiques des collections : Manuscrits, Revues, Lithographies, Livres, Journaux, Collections spécialisées, Audiovisuel', 'إحصائيات المجموعات: مخطوطات، مجلات، طباعة حجرية، كتب، صحف، مجموعات متخصصة، سمعي بصري', 4, true, '{"cms_tab": null, "description": "Section statistique générée dynamiquement depuis les collections"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'richtext', 'Actualités', 'الأخبار', 'Dernières actualités de la Bibliothèque Numérique', 'آخر أخبار المكتبة الرقمية', 5, true, '{"cms_tab": "actualites", "admin_route": "/admin/content-management-BN", "description": "Géré via l''onglet Actualités BN du CMS"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'custom', 'Expositions Virtuelles 360°', 'معارض افتراضية 360°', 'Carrousel des expositions virtuelles immersives', 'عرض دوار للمعارض الافتراضية الغامرة', 6, true, '{"cms_tab": "vexpo360-hero", "admin_route": "/admin/vexpo360", "description": "Géré via le CMS VExpo 360° et l''onglet Section VExpo du CMS BN"}'::jsonb),
('dafc8f22-60aa-48de-a4bb-2611cc8d8893', 'carousel', 'Ressources Électroniques', 'الموارد الإلكترونية', 'Carrousel des bases de données et ressources numériques partenaires (Cairn, EBSCO, BRILL, Al Manhal, ENI...)', 'عرض دوار لقواعد البيانات والموارد الرقمية الشريكة', 7, true, '{"cms_tab": null, "admin_route": "/admin/digital-library/electronic-bundles", "description": "Géré via l''interface dédiée Ressources électroniques"}'::jsonb);
