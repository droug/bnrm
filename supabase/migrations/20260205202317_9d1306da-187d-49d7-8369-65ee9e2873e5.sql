-- Populate cms_visual_resources with existing project assets

-- Logos
INSERT INTO cms_visual_resources (name, name_ar, category, file_url, file_type, description_fr, description_ar, tags, is_active) VALUES
('Logo BNRM Officiel', 'شعار المكتبة الوطنية الرسمي', 'logo', '/assets/logo-bnrm-officiel.png', 'png', 'Logo officiel de la Bibliothèque Nationale du Royaume du Maroc', 'الشعار الرسمي للمكتبة الوطنية', ARRAY['bnrm', 'logo', 'officiel'], true),
('Logo BNRM Portal', 'شعار بوابة المكتبة', 'logo', '/assets/bnrm-portal-logo.gif', 'gif', 'Logo animé du portail BNRM', 'شعار البوابة المتحرك', ARRAY['portail', 'logo', 'header'], true),
('Logo Bibliothèque Numérique', 'شعار المكتبة الرقمية', 'logo', '/assets/digital-library-logo.png', 'png', 'Logo de la Bibliothèque Numérique', 'شعار المكتبة الرقمية', ARRAY['bn', 'numerique', 'logo'], true),
('Emblème du Maroc', 'شعار المغرب', 'logo', '/assets/embleme-maroc.png', 'png', 'Emblème officiel du Royaume du Maroc', 'الشعار الرسمي للمملكة المغربية', ARRAY['maroc', 'embleme', 'officiel'], true),
('Logo Kitab', 'شعار كتاب', 'logo', '/assets/logo-kitab.png', 'png', 'Logo de la plateforme Kitab', 'شعار منصة كتاب', ARRAY['kitab', 'plateforme'], true),
('Logo BN Final', 'شعار المكتبة النهائي', 'logo', '/assets/BN_LOGO_FINAL.png', 'png', 'Logo final de la Bibliothèque Numérique', 'الشعار النهائي للمكتبة الرقمية', ARRAY['bn', 'logo', 'final'], true),

-- Logos partenaires
('Logo Cairn', 'شعار كايرن', 'logo', '/assets/logos/logo-cairn.svg', 'svg', 'Logo partenaire Cairn.info', 'شعار الشريك Cairn', ARRAY['partenaire', 'cairn', 'ressources'], true),
('Logo Europeana', 'شعار يوروبيانا', 'logo', '/assets/logos/logo-europeana.svg', 'svg', 'Logo partenaire Europeana', 'شعار الشريك يوروبيانا', ARRAY['partenaire', 'europeana'], true),
('Logo IFLA', 'شعار إيفلا', 'logo', '/assets/logos/logo-ifla.svg', 'svg', 'Logo IFLA - Fédération Internationale', 'الاتحاد الدولي لجمعيات المكتبات', ARRAY['partenaire', 'ifla', 'international'], true),
('Logo Almanhal', 'شعار المنهل', 'logo', '/assets/logos/logo-almanhal.png', 'png', 'Logo partenaire Al Manhal', 'شعار الشريك المنهل', ARRAY['partenaire', 'almanhal', 'arabe'], true),
('Logo Brill', 'شعار بريل', 'logo', '/assets/logos/logo-brill.png', 'png', 'Logo partenaire Brill', 'شعار الشريك Brill', ARRAY['partenaire', 'brill'], true),
('Logo ENI', 'شعار إيني', 'logo', '/assets/logos/logo-eni.svg', 'svg', 'Logo partenaire ENI', 'شعار الشريك ENI', ARRAY['partenaire', 'eni'], true),
('Logo RFN', 'شعار الشبكة الفرانكفونية', 'logo', '/assets/logos/logo-rfn.png', 'png', 'Réseau Francophone Numérique', 'الشبكة الرقمية الفرانكفونية', ARRAY['partenaire', 'rfn', 'francophone'], true),

-- Illustrations / Backgrounds
('Hero Bibliothèque', 'صورة البطل للمكتبة', 'illustration', '/assets/hero-library.jpg', 'jpg', 'Image principale pour la section Hero', 'الصورة الرئيسية لقسم البطل', ARRAY['hero', 'fond', 'accueil'], true),
('BNRM Building Night', 'مبنى المكتبة ليلاً', 'illustration', '/assets/bnrm-building-night.jpg', 'jpg', 'Vue nocturne du bâtiment BNRM', 'منظر ليلي لمبنى المكتبة', ARRAY['batiment', 'bnrm', 'nuit'], true),
('Digital Library Hero', 'صورة المكتبة الرقمية', 'illustration', '/assets/digital-library-hero.jpg', 'jpg', 'Image hero de la bibliothèque numérique', 'صورة البطل للمكتبة الرقمية', ARRAY['bn', 'hero', 'numerique'], true),
('CBM Background', 'خلفية CBM', 'illustration', '/assets/cbm-background.jpg', 'jpg', 'Fond pour le portail CBM', 'خلفية بوابة CBM', ARRAY['cbm', 'fond'], true),
('CBM Hero Banner', 'شعار CBM', 'illustration', '/assets/cbm-hero-banner.jpg', 'jpg', 'Bannière hero du portail CBM', 'شعار بوابة CBM', ARRAY['cbm', 'hero', 'banner'], true),
('Kitab Background', 'خلفية كتاب', 'illustration', '/assets/kitab-background.jpg', 'jpg', 'Arrière-plan plateforme Kitab', 'خلفية منصة كتاب', ARRAY['kitab', 'fond'], true),
('Manuscrits Background', 'خلفية المخطوطات', 'illustration', '/assets/manuscrits-background.jpg', 'jpg', 'Fond pour les pages manuscrits', 'خلفية صفحات المخطوطات', ARRAY['manuscrits', 'fond'], true),
('Activités Culturelles BG', 'خلفية الأنشطة الثقافية', 'illustration', '/assets/cultural-activities-background.jpg', 'jpg', 'Fond activités culturelles', 'خلفية الأنشطة الثقافية', ARRAY['culture', 'fond', 'activites'], true),

-- Pictogrammes / Patterns
('Zellige Pattern 1', 'نمط الزليج 1', 'pictogram', '/assets/zellige-pattern-1.jpg', 'jpg', 'Motif zellige marocain traditionnel', 'نمط الزليج المغربي التقليدي', ARRAY['zellige', 'pattern', 'marocain'], true),
('Zellige Pattern 2', 'نمط الزليج 2', 'pictogram', '/assets/zellige-pattern-2.jpg', 'jpg', 'Motif zellige variante 2', 'نمط الزليج المتنوع 2', ARRAY['zellige', 'pattern', 'marocain'], true),
('Zellige Pattern 3', 'نمط الزليج 3', 'pictogram', '/assets/zellige-pattern-3.jpg', 'jpg', 'Motif zellige variante 3', 'نمط الزليج المتنوع 3', ARRAY['zellige', 'pattern', 'marocain'], true),
('Calligraphie Islamique', 'الخط الإسلامي', 'pictogram', '/assets/islamic-calligraphy-pattern.jpg', 'jpg', 'Motif calligraphie arabe', 'نمط الخط العربي', ARRAY['calligraphie', 'islamique', 'arabe'], true),
('Moroccan Pattern BG', 'نمط مغربي', 'pictogram', '/assets/moroccan-pattern-bg.jpg', 'jpg', 'Fond motif marocain', 'خلفية نمط مغربي', ARRAY['pattern', 'marocain', 'fond'], true),

-- Icônes / Documents
('Logigramme Dépôt Légal', 'مخطط الإيداع القانوني', 'icon', '/assets/logigramme-depot-legal.png', 'png', 'Logigramme du processus de dépôt légal', 'مخطط عملية الإيداع القانوني', ARRAY['depot-legal', 'processus', 'diagramme'], true),
('Avatar Chatbot', 'صورة روبوت الدردشة', 'icon', '/assets/chatbot-avatar.png', 'png', 'Avatar du chatbot IA', 'صورة روبوت الدردشة الذكي', ARRAY['chatbot', 'ia', 'avatar'], true);

-- Update cms_menus with proper hierarchical structure matching Header.tsx
UPDATE cms_menus SET items = 
'[
  {"id":"d-info","label_fr":"Informations pratiques","label_ar":"معلومات عملية","order":0,"isCategory":true,"children":[
    {"id":"d1","label_fr":"Horaires et accès","label_ar":"المواعيد والوصول","url":"/practical-info","order":0,"description_fr":"Consultez nos horaires d''ouverture","description_ar":"استشر مواعيد فتحنا"},
    {"id":"d2","label_fr":"Catalogue de services et tarifs","label_ar":"كتالوج الخدمات والتعريفات","url":"/services-tarifs","order":1,"description_fr":"Découvrez nos services et leurs tarifs","description_ar":"اكتشف خدماتنا وتعريفاتها"},
    {"id":"d3","label_fr":"Visites virtuelles","label_ar":"الجولات الافتراضية","url":"/page/visites-virtuelles","order":2,"description_fr":"Explorez la bibliothèque depuis chez vous","description_ar":"استكشف المكتبة من منزلك"},
    {"id":"d4","label_fr":"Nos donateurs","label_ar":"متبرعونا","url":"/page/donateurs","order":3,"description_fr":"Recherchez par donateurs ou par œuvre","description_ar":"ابحث حسب المتبرعين أو العمل"}
  ]},
  {"id":"d-hist","label_fr":"Histoire et missions","label_ar":"التاريخ والمهام","order":1,"isCategory":true,"children":[
    {"id":"d5","label_fr":"Histoire de la bibliothèque","label_ar":"تاريخ المكتبة","url":"/page/histoire","order":0,"description_fr":"Missions et valeurs prônées","description_ar":"المهام والقيم المؤيدة"},
    {"id":"d6","label_fr":"Mot de la Direction","label_ar":"كلمة الإدارة","url":"/page/mot-direction","order":1,"description_fr":"Message du directeur de la BNRM","description_ar":"رسالة مدير المكتبة"},
    {"id":"d7","label_fr":"Organigramme","label_ar":"الهيكل التنظيمي","url":"/page/organigramme","order":2,"description_fr":"Structure organisationnelle de la BNRM","description_ar":"الهيكل التنظيمي للمكتبة"}
  ]}
]'::jsonb
WHERE menu_code = 'header-decouvrir';

-- Menu Services with sub-categories
UPDATE cms_menus SET items = 
'[
  {"id":"s-usagers","label_fr":"Services aux usagers","label_ar":"الخدمات للمستخدمين","order":0,"isCategory":true,"children":[
    {"id":"s1","label_fr":"Inscription en ligne / Réinscription","label_ar":"التسجيل عبر الإنترنت / إعادة التسجيل","url":"/auth?action=signup","order":0,"description_fr":"Créez votre compte ou renouvelez votre abonnement","description_ar":"أنشئ حسابك أو جدد اشتراكك"},
    {"id":"s2","label_fr":"Pass journalier","label_ar":"التصريح اليومي","url":"/services-bnrm?open=daily-pass","order":1,"description_fr":"Accès illimité gratuit - 1 fois par an","description_ar":"وصول مجاني غير محدود - مرة واحدة في السنة"},
    {"id":"s3","label_fr":"Consulter la Bibliothèque Nationale","label_ar":"استشارة المكتبة الوطنية","url":"/digital-library","order":2,"description_fr":"Accédez à notre bibliothèque numérique","description_ar":"الوصول إلى مكتبتنا الرقمية"},
    {"id":"s4","label_fr":"Réserver un document","label_ar":"حجز وثيقة","url":"/cbn/reserver-ouvrage","order":3,"description_fr":"Recherchez et réservez un document CBN","description_ar":"ابحث واحجز وثيقة"},
    {"id":"s5","label_fr":"Réserver nos espaces","label_ar":"حجز مساحاتنا","url":"/reservation-espaces","order":4,"description_fr":"Réservez un espace de travail ou une salle","description_ar":"احجز مساحة عمل أو قاعة"}
  ]},
  {"id":"s-special","label_fr":"Services spécialisés","label_ar":"الخدمات المتخصصة","order":1,"isCategory":true,"children":[
    {"id":"s6","label_fr":"Dépôt légal","label_ar":"الإيداع القانوني","url":"/depot-legal","order":0,"description_fr":"Service obligatoire selon le Dahir n° 1-60-050 (1960)","description_ar":"خدمة إلزامية حسب الظهير رقم 1-60-050 (1960)"},
    {"id":"s7","label_fr":"Demande de reproduction","label_ar":"طلب النسخ","url":"/demande-reproduction","order":1,"description_fr":"Commandez des reproductions de documents","description_ar":"اطلب نسخًا من الوثائق"},
    {"id":"s8","label_fr":"Demande de restauration","label_ar":"طلب الترميم","url":"/demande-restauration","order":2,"description_fr":"Service de restauration de documents anciens","description_ar":"خدمة ترميم الوثائق القديمة"}
  ]}
]'::jsonb
WHERE menu_code = 'header-services';

-- Menu Actualités with sub-categories
UPDATE cms_menus SET items = 
'[
  {"id":"a-news","label_fr":"Actualités","label_ar":"الأخبار","order":0,"isCategory":true,"children":[
    {"id":"a1","label_fr":"Actualités et publications","label_ar":"الأخبار والمنشورات","url":"/news","order":0,"description_fr":"Nouvelles acquisitions et actualités du fonds documentaire","description_ar":"المقتنيات الجديدة وأخبار الرصيد الوثائقي"},
    {"id":"a2","label_fr":"Ils parlent de nous","label_ar":"يتحدثون عنا","url":"/page/ils-parlent-de-nous","order":1,"description_fr":"La BNRM dans les médias et publications","description_ar":"المكتبة في وسائل الإعلام والمنشورات"}
  ]},
  {"id":"a-culture","label_fr":"Notre programmation culturelle","label_ar":"برنامجنا الثقافي","order":1,"isCategory":true,"children":[
    {"id":"a3","label_fr":"Programmation culturelle","label_ar":"البرمجة الثقافية","url":"/page/programmation-culturelle","order":0,"description_fr":"Découvrez nos activités culturelles","description_ar":"اكتشف أنشطتنا الثقافية"},
    {"id":"a4","label_fr":"Agenda","label_ar":"الأجندة","url":"/page/agenda","order":1,"description_fr":"Calendrier de nos événements","description_ar":"تقويم فعالياتنا"},
    {"id":"a5","label_fr":"Nos expositions","label_ar":"معارضنا","url":"/page/expositions","order":2,"description_fr":"Expositions actuelles et passées","description_ar":"المعارض الحالية والسابقة"}
  ]}
]'::jsonb
WHERE menu_code = 'header-actualites';

-- Menu Mécénat
UPDATE cms_menus SET items = 
'[
  {"id":"m1","label_fr":"Nos donateurs","label_ar":"متبرعونا","url":"/donateurs","order":0,"description_fr":"Découvrez nos mécènes et leurs œuvres","description_ar":"اكتشف المتبرعين وأعمالهم"},
  {"id":"m2","label_fr":"Offrir des collections","label_ar":"تقديم مجموعات","url":"/offrir-collections","order":1,"description_fr":"Enrichir le fonds documentaire de la bibliothèque","description_ar":"إغناء الرصيد الوثائقي للمكتبة"},
  {"id":"m3","label_fr":"Dons financiers","label_ar":"التبرعات المالية","url":"/donation","order":2,"description_fr":"Soutenez la bibliothèque par vos dons","description_ar":"ادعم المكتبة بتبرعاتك"}
]'::jsonb
WHERE menu_code = 'header-mecenat';