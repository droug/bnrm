-- Enrichir l'exposition de démo avec plus de métadonnées
UPDATE vexpo_exhibitions
SET 
  cover_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80',
  intro_fr = 'Bienvenue dans notre exposition virtuelle de démonstration ! Cette visite immersive vous permet de découvrir les fonctionnalités du système VExpo 360° : navigation panoramique, hotspots interactifs (texte, œuvres, médias, liens), et bien plus. Explorez deux salles thématiques et interagissez avec les différents points d''intérêt pour comprendre le potentiel de cette technologie.',
  intro_ar = 'مرحبًا بكم في معرضنا الافتراضي التجريبي! تتيح لك هذه الجولة الغامرة اكتشاف ميزات نظام VExpo 360°: التنقل البانورامي، والنقاط التفاعلية (نص، أعمال، وسائط، روابط)، وأكثر من ذلك. استكشف قاعتين موضوعيتين وتفاعل مع نقاط الاهتمام المختلفة لفهم إمكانيات هذه التقنية.',
  teaser_fr = 'Découvrez les panoramas 360° immersifs avec hotspots interactifs : textes, œuvres d''art, vidéos et navigation entre salles.',
  teaser_ar = 'اكتشف البانوراما 360° الغامرة مع النقاط التفاعلية: نصوص، أعمال فنية، فيديوهات والتنقل بين القاعات.',
  location_text_fr = 'Visite en ligne - Accessible 24h/24',
  location_text_ar = 'زيارة عبر الإنترنت - متاحة على مدار الساعة',
  opening_hours_fr = 'Disponible 24h/24, 7j/7',
  opening_hours_ar = 'متاح على مدار الساعة، 7 أيام في الأسبوع',
  cta_title_fr = 'Prêt à explorer ?',
  cta_title_ar = 'هل أنت مستعد للاستكشاف؟',
  meta_title_fr = 'Démo VExpo 360° - Visite Virtuelle Interactive',
  meta_description_fr = 'Explorez notre démonstration de visite virtuelle 360° avec hotspots interactifs, œuvres d''art et navigation immersive.',
  meta_title_ar = 'عرض VExpo 360° التجريبي - جولة افتراضية تفاعلية',
  meta_description_ar = 'استكشف عرضنا التجريبي للجولة الافتراضية 360° مع النقاط التفاعلية والأعمال الفنية والتنقل الغامر.'
WHERE slug = 'demo-expo-360';

-- Ajouter plus d'œuvres dans la galerie
INSERT INTO vexpo_artworks (id, title_fr, title_ar, description_fr, description_ar, creator_author, creation_date, artwork_type, images, inventory_id, keywords, external_catalog_url, is_active, show_visit_cta)
VALUES 
  (
    gen_random_uuid(),
    'Carte ancienne du Maroc',
    'خريطة قديمة للمغرب',
    'Carte topographique du Royaume du Maroc datant du XVIIIe siècle, illustrant les principales villes et routes commerciales de l''époque.',
    'خريطة طبوغرافية للمملكة المغربية تعود إلى القرن الثامن عشر، توضح المدن الرئيسية والطرق التجارية في تلك الفترة.',
    'Cartographe inconnu',
    'XVIIIe siècle',
    'map',
    '[{"url": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80", "alt": "Carte ancienne du Maroc"}]',
    'DEMO-002',
    ARRAY['carte', 'géographie', 'histoire', 'Maroc'],
    'https://bnrm.lovable.app/digital-library',
    true,
    true
  ),
  (
    gen_random_uuid(),
    'Photographie historique - Médina de Fès',
    'صورة تاريخية - مدينة فاس القديمة',
    'Photographie en noir et blanc de la médina de Fès au début du XXe siècle, montrant l''architecture traditionnelle marocaine.',
    'صورة بالأبيض والأسود للمدينة القديمة في فاس في بداية القرن العشرين، تُظهر العمارة المغربية التقليدية.',
    'Photographe anonyme',
    '1920',
    'photograph',
    '[{"url": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1400&q=80", "alt": "Médina de Fès historique"}]',
    'DEMO-003',
    ARRAY['photographie', 'Fès', 'médina', 'histoire'],
    'https://bnrm.lovable.app/digital-library',
    true,
    true
  ),
  (
    gen_random_uuid(),
    'Calligraphie arabe - Verset coranique',
    'خط عربي - آية قرآنية',
    'Calligraphie magistrale en style thuluth représentant un verset coranique, réalisée à l''encre d''or sur parchemin.',
    'خط فني رائع بأسلوب الثلث يمثل آية قرآنية، منفذ بحبر الذهب على الرق.',
    'Maître calligraphe',
    'XVe siècle',
    'manuscript',
    '[{"url": "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=1400&q=80", "alt": "Calligraphie arabe"}]',
    'DEMO-004',
    ARRAY['calligraphie', 'arabe', 'art', 'islam'],
    'https://bnrm.lovable.app/digital-library',
    true,
    true
  );

-- Ajouter des hotspots supplémentaires pour la Salle 1
INSERT INTO vexpo_hotspots (panorama_id, hotspot_type, yaw, pitch, label_fr, label_ar, rich_text_fr, rich_text_ar, icon_name, icon_color, icon_size, display_order, priority, show_on_mobile, is_active)
VALUES 
  (
    '91814379-04ff-4dfc-b4ba-46161e86c107',
    'text',
    -80,
    15,
    'Bienvenue',
    'مرحبا',
    '<h3>Bienvenue dans l''exposition</h3><p>Cette visite virtuelle vous permet d''explorer notre collection à 360°. Cliquez sur les différents points d''intérêt pour découvrir :</p><ul><li>📜 Des textes explicatifs</li><li>🖼️ Des œuvres d''art</li><li>🎬 Des vidéos</li><li>🚪 Des passages vers d''autres salles</li></ul>',
    '<h3>مرحبًا بكم في المعرض</h3><p>تتيح لك هذه الجولة الافتراضية استكشاف مجموعتنا بزاوية 360°. انقر على نقاط الاهتمام المختلفة لاكتشاف:</p><ul><li>📜 نصوص توضيحية</li><li>🖼️ أعمال فنية</li><li>🎬 مقاطع فيديو</li><li>🚪 ممرات إلى قاعات أخرى</li></ul>',
    'info',
    '#D4AF37',
    28,
    5,
    1,
    true,
    true
  ),
  (
    '91814379-04ff-4dfc-b4ba-46161e86c107',
    'media',
    120,
    -5,
    'Présentation audio',
    'عرض صوتي',
    '<p>Écoutez notre guide audio présentant cette collection exceptionnelle.</p>',
    '<p>استمع إلى دليلنا الصوتي الذي يقدم هذه المجموعة الاستثنائية.</p>',
    'headphones',
    '#3B82F6',
    24,
    6,
    2,
    true,
    true
  );

-- Ajouter des hotspots pour la Salle 2
INSERT INTO vexpo_hotspots (panorama_id, hotspot_type, yaw, pitch, label_fr, label_ar, rich_text_fr, rich_text_ar, icon_name, icon_color, icon_size, display_order, priority, show_on_mobile, is_active)
VALUES 
  (
    '2dadb049-3a52-4046-9453-b4d285e25b24',
    'text',
    45,
    10,
    'Salle des manuscrits',
    'قاعة المخطوطات',
    '<h3>Salle des Manuscrits Anciens</h3><p>Cette salle présente notre collection de manuscrits rares datant du XIIe au XVIIIe siècle. Vous y découvrirez des enluminures exceptionnelles et des textes historiques uniques.</p><p><strong>Points forts :</strong></p><ul><li>Manuscrits andalous</li><li>Textes scientifiques médiévaux</li><li>Enluminures dorées</li></ul>',
    '<h3>قاعة المخطوطات القديمة</h3><p>تعرض هذه القاعة مجموعتنا من المخطوطات النادرة التي تعود إلى القرنين الثاني عشر والثامن عشر. ستكتشفون زخارف استثنائية ونصوصًا تاريخية فريدة.</p><p><strong>أبرز المعروضات:</strong></p><ul><li>مخطوطات أندلسية</li><li>نصوص علمية من العصور الوسطى</li><li>زخارف مذهبة</li></ul>',
    'book-open',
    '#10B981',
    28,
    2,
    1,
    true,
    true
  ),
  (
    '2dadb049-3a52-4046-9453-b4d285e25b24',
    'media',
    -60,
    0,
    'Vidéo documentaire',
    'فيلم وثائقي',
    '<p>Découvrez l''histoire de notre collection à travers ce documentaire exclusif.</p>',
    '<p>اكتشف تاريخ مجموعتنا من خلال هذا الفيلم الوثائقي الحصري.</p>',
    'video',
    '#EF4444',
    24,
    3,
    2,
    true,
    true
  ),
  (
    '2dadb049-3a52-4046-9453-b4d285e25b24',
    'text',
    90,
    -10,
    'Conservation',
    'الحفظ',
    '<h3>La Conservation des Manuscrits</h3><p>La préservation de ces trésors nécessite des conditions spécifiques :</p><ul><li>🌡️ Température contrôlée : 18-20°C</li><li>💧 Humidité : 45-55%</li><li>💡 Éclairage : < 50 lux</li></ul><p>Notre équipe de conservateurs veille quotidiennement sur ces documents précieux.</p>',
    '<h3>حفظ المخطوطات</h3><p>يتطلب الحفاظ على هذه الكنوز شروطًا خاصة:</p><ul><li>🌡️ درجة حرارة متحكم بها: 18-20 درجة مئوية</li><li>💧 رطوبة: 45-55%</li><li>💡 إضاءة: أقل من 50 لوكس</li></ul><p>يسهر فريق المحافظين لدينا يوميًا على هذه الوثائق الثمينة.</p>',
    'shield',
    '#8B5CF6',
    24,
    4,
    3,
    true,
    true
  );

-- Mettre à jour les couleurs des hotspots existants pour plus de visibilité
UPDATE vexpo_hotspots 
SET icon_color = '#D4AF37', icon_size = 26
WHERE label_fr = 'Texte';

UPDATE vexpo_hotspots 
SET icon_color = '#F59E0B', icon_size = 26
WHERE label_fr = 'Œuvre';

UPDATE vexpo_hotspots 
SET icon_color = '#EF4444', icon_size = 26
WHERE label_fr = 'Vidéo';

UPDATE vexpo_hotspots 
SET icon_color = '#3B82F6', icon_size = 28
WHERE label_fr IN ('Aller à la salle 2', 'Retour à la salle 1');