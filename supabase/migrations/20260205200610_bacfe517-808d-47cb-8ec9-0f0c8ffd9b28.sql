-- Insérer les menus du portail BNRM basés sur le Header existant
INSERT INTO cms_menus (menu_code, menu_name, is_active, items) VALUES

-- Menu principal "Découvrir"
('header-decouvrir', 'Menu Découvrir', true, '[
  {"id": "d1", "label_fr": "Horaires et accès", "label_ar": "المواعيد والوصول", "url": "/practical-info", "order": 0},
  {"id": "d2", "label_fr": "Catalogue de services et tarifs", "label_ar": "كتالوج الخدمات والتعريفات", "url": "/services-tarifs", "order": 1},
  {"id": "d3", "label_fr": "Visites virtuelles", "label_ar": "الجولات الافتراضية", "url": "/page/visites-virtuelles", "order": 2},
  {"id": "d4", "label_fr": "Nos donateurs", "label_ar": "متبرعونا", "url": "/page/donateurs", "order": 3},
  {"id": "d5", "label_fr": "Histoire de la bibliothèque", "label_ar": "تاريخ المكتبة", "url": "/page/histoire", "order": 4},
  {"id": "d6", "label_fr": "Mot de la Direction", "label_ar": "كلمة الإدارة", "url": "/page/mot-direction", "order": 5},
  {"id": "d7", "label_fr": "Organigramme", "label_ar": "الهيكل التنظيمي", "url": "/page/organigramme", "order": 6}
]'::jsonb),

-- Menu principal "Services"
('header-services', 'Menu Services', true, '[
  {"id": "s1", "label_fr": "Inscription en ligne", "label_ar": "التسجيل عبر الإنترنت", "url": "/auth?action=signup", "order": 0},
  {"id": "s2", "label_fr": "Pass journalier", "label_ar": "التصريح اليومي", "url": "/services-bnrm?open=daily-pass", "order": 1},
  {"id": "s3", "label_fr": "Bibliothèque Numérique", "label_ar": "المكتبة الرقمية", "url": "/digital-library", "order": 2},
  {"id": "s4", "label_fr": "Réserver un document", "label_ar": "حجز وثيقة", "url": "/cbn/reserver-ouvrage", "order": 3},
  {"id": "s5", "label_fr": "Réserver nos espaces", "label_ar": "حجز مساحاتنا", "url": "/reservation-espaces", "order": 4},
  {"id": "s6", "label_fr": "Dépôt légal", "label_ar": "الإيداع القانوني", "url": "/depot-legal", "order": 5},
  {"id": "s7", "label_fr": "Demande de reproduction", "label_ar": "طلب النسخ", "url": "/demande-reproduction", "order": 6},
  {"id": "s8", "label_fr": "Demande de restauration", "label_ar": "طلب الترميم", "url": "/demande-restauration", "order": 7}
]'::jsonb),

-- Menu principal "Actualités"
('header-actualites', 'Menu Actualités', true, '[
  {"id": "a1", "label_fr": "Actualités et publications", "label_ar": "الأخبار والمنشورات", "url": "/news", "order": 0},
  {"id": "a2", "label_fr": "Ils parlent de nous", "label_ar": "يتحدثون عنا", "url": "/page/ils-parlent-de-nous", "order": 1},
  {"id": "a3", "label_fr": "Programmation culturelle", "label_ar": "البرمجة الثقافية", "url": "/page/programmation-culturelle", "order": 2},
  {"id": "a4", "label_fr": "Agenda", "label_ar": "الأجندة", "url": "/page/agenda", "order": 3},
  {"id": "a5", "label_fr": "Nos expositions", "label_ar": "معارضنا", "url": "/page/expositions", "order": 4}
]'::jsonb),

-- Menu principal "Mécénat"
('header-mecenat', 'Menu Mécénat', true, '[
  {"id": "m1", "label_fr": "Nos donateurs", "label_ar": "متبرعونا", "url": "/donateurs", "order": 0},
  {"id": "m2", "label_fr": "Offrir des collections", "label_ar": "تقديم مجموعات", "url": "/offrir-collections", "order": 1},
  {"id": "m3", "label_fr": "Dons financiers", "label_ar": "التبرعات المالية", "url": "/donation", "order": 2}
]'::jsonb),

-- Menu Footer - Liens rapides
('footer-liens-rapides', 'Footer - Liens Rapides', true, '[
  {"id": "f1", "label_fr": "Catalogue", "label_ar": "الفهرس", "url": "/catalogue", "order": 0},
  {"id": "f2", "label_fr": "Collections", "label_ar": "المجموعات", "url": "/collections", "order": 1},
  {"id": "f3", "label_fr": "Horaires", "label_ar": "المواعيد", "url": "/practical-info", "order": 2},
  {"id": "f4", "label_fr": "À propos", "label_ar": "حول", "url": "/page/histoire", "order": 3},
  {"id": "f5", "label_fr": "Services", "label_ar": "الخدمات", "url": "/services-tarifs", "order": 4},
  {"id": "f6", "label_fr": "Contact", "label_ar": "اتصل بنا", "url": "/contact", "order": 5}
]'::jsonb),

-- Menu Footer - Aide et support
('footer-aide', 'Footer - Aide et Support', true, '[
  {"id": "h1", "label_fr": "FAQ", "label_ar": "الأسئلة الشائعة", "url": "/help", "order": 0},
  {"id": "h2", "label_fr": "Règlements", "label_ar": "اللوائح", "url": "/page/reglements", "order": 1},
  {"id": "h3", "label_fr": "Contacts", "label_ar": "الاتصالات", "url": "/contact", "order": 2},
  {"id": "h4", "label_fr": "Chatbot d''assistance", "label_ar": "روبوت المساعدة", "url": "/help#chatbot", "order": 3}
]'::jsonb),

-- Menu Footer - Paiements
('footer-paiements', 'Footer - Paiements', true, '[
  {"id": "p1", "label_fr": "e-Wallet BNRM", "label_ar": "المحفظة الإلكترونية", "url": "/wallet", "order": 0},
  {"id": "p2", "label_fr": "Services BNRM", "label_ar": "خدمات المكتبة", "url": "/services-tarifs", "order": 1},
  {"id": "p3", "label_fr": "Reproduction", "label_ar": "النسخ", "url": "/demande-reproduction", "order": 2},
  {"id": "p4", "label_fr": "Dépôt légal", "label_ar": "الإيداع القانوني", "url": "/depot-legal", "order": 3}
]'::jsonb),

-- Menu Footer - Légal
('footer-legal', 'Footer - Mentions Légales', true, '[
  {"id": "l1", "label_fr": "Conditions d''utilisation", "label_ar": "شروط الاستخدام", "url": "/page/conditions", "order": 0},
  {"id": "l2", "label_fr": "Mentions légales", "label_ar": "الإشعارات القانونية", "url": "/page/mentions-legales", "order": 1},
  {"id": "l3", "label_fr": "Politique de confidentialité", "label_ar": "سياسة الخصوصية", "url": "/page/confidentialite", "order": 2},
  {"id": "l4", "label_fr": "Accessibilité", "label_ar": "إمكانية الوصول", "url": "/page/accessibilite", "order": 3}
]'::jsonb);


-- Insérer la configuration du footer
INSERT INTO cms_footer (is_active, legal_text_fr, legal_text_ar, columns, social_links, logos) VALUES (
  true,
  '© 2024 Bibliothèque Nationale du Royaume du Maroc. Tous droits réservés.',
  '© 2024 المكتبة الوطنية للمملكة المغربية. جميع الحقوق محفوظة.',
  '[
    {
      "title_fr": "Liens rapides",
      "title_ar": "روابط سريعة",
      "links": [
        {"label_fr": "Catalogue", "label_ar": "الفهرس", "url": "/catalogue", "is_external": false},
        {"label_fr": "Collections", "label_ar": "المجموعات", "url": "/collections", "is_external": false},
        {"label_fr": "Horaires", "label_ar": "المواعيد", "url": "/practical-info", "is_external": false},
        {"label_fr": "À propos", "label_ar": "حول", "url": "/page/histoire", "is_external": false},
        {"label_fr": "Services", "label_ar": "الخدمات", "url": "/services-tarifs", "is_external": false},
        {"label_fr": "Contact", "label_ar": "اتصل بنا", "url": "/contact", "is_external": false}
      ]
    },
    {
      "title_fr": "Aide et support",
      "title_ar": "المساعدة والدعم",
      "links": [
        {"label_fr": "FAQ", "label_ar": "الأسئلة الشائعة", "url": "/help", "is_external": false},
        {"label_fr": "Règlements", "label_ar": "اللوائح", "url": "/page/reglements", "is_external": false},
        {"label_fr": "Contacts", "label_ar": "الاتصالات", "url": "/contact", "is_external": false},
        {"label_fr": "Chatbot", "label_ar": "روبوت المساعدة", "url": "/help#chatbot", "is_external": false}
      ]
    },
    {
      "title_fr": "Paiements",
      "title_ar": "المدفوعات",
      "links": [
        {"label_fr": "e-Wallet BNRM", "label_ar": "المحفظة الإلكترونية", "url": "/wallet", "is_external": false},
        {"label_fr": "Services BNRM", "label_ar": "خدمات المكتبة", "url": "/services-tarifs", "is_external": false},
        {"label_fr": "Reproduction", "label_ar": "النسخ", "url": "/demande-reproduction", "is_external": false},
        {"label_fr": "Dépôt légal", "label_ar": "الإيداع القانوني", "url": "/depot-legal", "is_external": false}
      ]
    },
    {
      "title_fr": "Contact",
      "title_ar": "اتصل بنا",
      "links": [
        {"label_fr": "Avenue Ibn Khaldoun, Rabat, Maroc", "label_ar": "شارع ابن خلدون، الرباط، المغرب", "url": "#", "is_external": false},
        {"label_fr": "+212 537 27 16 33", "label_ar": "+212 537 27 16 33", "url": "tel:+212537271633", "is_external": false},
        {"label_fr": "contact@bnrm.ma", "label_ar": "contact@bnrm.ma", "url": "mailto:contact@bnrm.ma", "is_external": false}
      ]
    }
  ]'::jsonb,
  '[
    {"platform": "facebook", "url": "https://www.facebook.com/BNRM.officiel", "is_active": true},
    {"platform": "twitter", "url": "https://twitter.com/BNRM_officiel", "is_active": true},
    {"platform": "instagram", "url": "https://www.instagram.com/bnrm_officiel", "is_active": true},
    {"platform": "linkedin", "url": "https://www.linkedin.com/company/bnrm", "is_active": true},
    {"platform": "youtube", "url": "https://www.youtube.com/@BNRM_officiel", "is_active": true}
  ]'::jsonb,
  '[]'::jsonb
);