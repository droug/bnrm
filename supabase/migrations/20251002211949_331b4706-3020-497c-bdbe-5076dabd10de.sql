-- Enrichir la base de connaissances du chatbot avec des informations détaillées

-- Ajouter des informations sur les œuvres
INSERT INTO public.chatbot_knowledge_base (title, content, category, language, keywords, priority, is_active)
VALUES 
('Collections de manuscrits', 'La BNRM possède une collection exceptionnelle de plus de 10 000 manuscrits arabes, amazighs et hébraïques. Les manuscrits couvrent diverses disciplines : droit islamique (fiqh), littérature, histoire, sciences, médecine traditionnelle. Parmi les pièces remarquables : manuscrits du Fiqh Maliki, œuvres d''Ibn Khaldoun, traités de médecine d''Avicenne, poésie andalouse.', 'works', 'fr', ARRAY['manuscrits', 'collections', 'fiqh', 'littérature'], 9, true),

('Accès aux œuvres numérisées', 'Les chercheurs authentifiés peuvent accéder à la bibliothèque numérique contenant plus de 5000 ouvrages numérisés. Les documents sont disponibles en plusieurs formats (PDF, JPEG, TIFF). Le téléchargement nécessite une autorisation selon le statut : chercheurs (50 ouvrages/mois), partenaires (200/mois), abonnés premium (100/mois). Les utilisateurs publics peuvent consulter en ligne uniquement.', 'download', 'fr', ARRAY['téléchargement', 'numérique', 'accès', 'PDF'], 8, true),

('Auteurs marocains patrimoniaux', 'La BNRM conserve les œuvres des grands auteurs marocains : Ibn Khaldoun (historien et sociologue, 1332-1406), Ibn Battûta (explorateur et écrivain, 1304-1377), Al-Hassan al-Wazzân/Léon l''Africain (géographe), Ibn Zaydoun (poète andalou). Chaque auteur dispose d''une notice biographique détaillée accessible dans le catalogue.', 'authors', 'fr', ARRAY['auteurs', 'écrivains', 'poètes', 'historiens'], 8, true),

('Éditeurs et maisons d''édition', 'Historique des principaux éditeurs marocains conservés à la BNRM : Dar al-Kitab (fondée en 1920, spécialisée en littérature classique), Éditions Le Fennec (1987, littérature contemporaine), Tarik Éditions (1992, histoire et patrimoine). La BNRM archive toutes les publications marocaines via le dépôt légal depuis 1970.', 'publishers', 'fr', ARRAY['éditeurs', 'maisons d''édition', 'publications'], 7, true),

('Services de reproduction', 'Service de reproduction numérique et papier disponible pour tous les utilisateurs. Tarifs : Numérisation A4 (5 DH/page), A3 (8 DH/page), Reproduction papier (10 DH/page). Délais : 48h pour demandes standard, 24h pour demandes urgentes (+50%). Formats disponibles : PDF, JPEG, TIFF, PNG. Paiement : carte bancaire, virement, espèces, chèque.', 'services', 'fr', ARRAY['reproduction', 'numérisation', 'tarifs', 'services'], 9, true),

('Dépôt légal au Maroc', 'Le dépôt légal est obligatoire pour toutes les publications au Maroc (Dahir n° 1-00-20 du 15 février 2000). Les éditeurs, imprimeurs et auteurs doivent déposer 4 exemplaires de chaque publication à la BNRM dans les 30 jours suivant la parution. Attribution gratuite des numéros ISBN, ISSN et ISMN. Procédure en ligne disponible via le portail BNRM.', 'services', 'fr', ARRAY['dépôt légal', 'ISBN', 'ISSN', 'réglementation'], 9, true);

-- Version arabe des connaissances
INSERT INTO public.chatbot_knowledge_base (title, content, category, language, keywords, priority, is_active)
VALUES 
('مجموعات المخطوطات', 'تمتلك المكتبة الوطنية مجموعة استثنائية تضم أكثر من 10,000 مخطوط عربي وأمازيغي وعبري. تغطي المخطوطات مختلف التخصصات: الفقه الإسلامي، الأدب، التاريخ، العلوم، الطب التقليدي. من بين القطع البارزة: مخطوطات الفقه المالكي، أعمال ابن خلدون، رسائل الطب لابن سينا، الشعر الأندلسي.', 'works', 'ar', ARRAY['مخطوطات', 'مجموعات', 'فقه', 'أدب'], 9, true),

('الوصول إلى الأعمال الرقمية', 'يمكن للباحثين المصادق عليهم الوصول إلى المكتبة الرقمية التي تحتوي على أكثر من 5000 كتاب رقمي. الوثائق متاحة بعدة صيغ (PDF، JPEG، TIFF). يتطلب التحميل إذنًا حسب الحالة: الباحثون (50 كتابًا/شهر)، الشركاء (200/شهر)، المشتركون المميزون (100/شهر). يمكن للمستخدمين العموميين الاطلاع عبر الإنترنت فقط.', 'download', 'ar', ARRAY['تحميل', 'رقمي', 'وصول', 'PDF'], 8, true),

('المؤلفون المغاربة التراثيون', 'تحتفظ المكتبة الوطنية بأعمال كبار المؤلفين المغاربة: ابن خلدون (مؤرخ وعالم اجتماع، 1332-1406)، ابن بطوطة (مستكشف وكاتب، 1304-1377)، الحسن الوزان/ليون الأفريقي (جغرافي)، ابن زيدون (شاعر أندلسي). لكل مؤلف ملاحظة بيوغرافية مفصلة متاحة في الفهرس.', 'authors', 'ar', ARRAY['مؤلفون', 'كتاب', 'شعراء', 'مؤرخون'], 8, true),

('خدمات النسخ', 'خدمة النسخ الرقمي والورقي متاحة لجميع المستخدمين. التعريفات: الرقمنة A4 (5 درهم/صفحة)، A3 (8 درهم/صفحة)، النسخ الورقي (10 درهم/صفحة). المواعيد: 48 ساعة للطلبات العادية، 24 ساعة للطلبات العاجلة (+50%). الصيغ المتاحة: PDF، JPEG، TIFF، PNG. الدفع: بطاقة بنكية، تحويل، نقداً، شيك.', 'services', 'ar', ARRAY['نسخ', 'رقمنة', 'تعريفات', 'خدمات'], 9, true);