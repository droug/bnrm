-- Créer le formulaire pour BD et Logiciels
INSERT INTO public.forms (form_key, form_name, module, description)
VALUES ('legal_deposit_bd_software', 'Dépôt légal - BD et Logiciels', 'bd_software', 'Formulaire de dépôt légal pour les bandes dessinées et logiciels');

-- Créer la version
INSERT INTO public.form_versions (form_id, version_number, is_published, structure)
SELECT id, 1, true,
  jsonb_build_array(
    jsonb_build_object('key', 'author_info', 'title_fr', 'Identification de l''Auteur/Créateur', 'title_ar', 'تعريف المؤلف/المبدع', 'order', 1),
    jsonb_build_object('key', 'work_info', 'title_fr', 'Identification de l''Œuvre', 'title_ar', 'تعريف العمل', 'order', 2),
    jsonb_build_object('key', 'publisher_info', 'title_fr', 'Identification de l''Éditeur', 'title_ar', 'تعريف الناشر', 'order', 3),
    jsonb_build_object('key', 'producer_info', 'title_fr', 'Identification du Producteur', 'title_ar', 'تعريف المنتج', 'order', 4),
    jsonb_build_object('key', 'required_documents', 'title_fr', 'Documents Requis', 'title_ar', 'الوثائق المطلوبة', 'order', 5)
  )
FROM public.forms WHERE form_key = 'legal_deposit_bd_software';

-- Champs BD/Logiciels
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'author_info', 'author_name', 'text', 'Nom complet de l''auteur/créateur', 'الاسم الكامل للمؤلف/المبدع', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'author_info', 'author_nationality', 'text', 'Nationalité', 'الجنسية', false, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'author_info', 'author_email', 'text', 'Email', 'البريد الإلكتروني', true, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'author_info', 'author_phone', 'text', 'Téléphone', 'الهاتف', false, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'work_info', 'work_title', 'text', 'Titre de l''œuvre', 'عنوان العمل', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'work_info', 'work_type', 'select', 'Type d''œuvre', 'نوع العمل', true, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index, config)
SELECT fv.id, 'work_info', 'work_format', 'select', 'Format', 'الشكل', true, 3,
  jsonb_build_object('options', jsonb_build_array(
    jsonb_build_object('value', 'bd_papier', 'label_fr', 'BD Papier', 'label_ar', 'قصص مصورة ورقية'),
    jsonb_build_object('value', 'bd_numerique', 'label_fr', 'BD Numérique', 'label_ar', 'قصص مصورة رقمية'),
    jsonb_build_object('value', 'logiciel_cd', 'label_fr', 'Logiciel CD/DVD', 'label_ar', 'برمجيات قرص مضغوط'),
    jsonb_build_object('value', 'logiciel_telechargeable', 'label_fr', 'Logiciel Téléchargeable', 'label_ar', 'برمجيات قابلة للتنزيل'),
    jsonb_build_object('value', 'jeu_video', 'label_fr', 'Jeu Vidéo', 'label_ar', 'لعبة فيديو')
  ))
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'work_info', 'isbn_registration', 'text', 'ISBN / Numéro d''enregistrement', 'الرقم الدولي الموحد للكتاب / رقم التسجيل', false, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'work_info', 'publication_date', 'date', 'Date de publication/sortie', 'تاريخ النشر/الإصدار', true, 5
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'work_info', 'language', 'select', 'Langue', 'اللغة', true, 6
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_name', 'text', 'Nom de l''éditeur', 'اسم الناشر', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_address', 'textarea', 'Adresse complète', 'العنوان الكامل', true, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_phone', 'text', 'Téléphone', 'الهاتف', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_email', 'text', 'Email', 'البريد الإلكتروني', true, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'producer_info', 'producer_name', 'text', 'Nom du producteur/développeur', 'اسم المنتج/المطور', false, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'producer_info', 'producer_address', 'textarea', 'Adresse du producteur', 'عنوان المنتج', false, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'producer_info', 'producer_country', 'select', 'Pays du producteur', 'بلد المنتج', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'work_copy', 'file', 'Exemplaire de l''œuvre (PDF pour BD, fichier exécutable pour logiciel)', 'نسخة من العمل (PDF للقصص المصورة، ملف تنفيذي للبرمجيات)', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'cover_image', 'file', 'Image de couverture/pochette', 'صورة الغلاف', true, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'author_id', 'file', 'Copie de la pièce d''identité de l''auteur', 'نسخة من بطاقة هوية المؤلف', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_bd_software' AND fv.version_number = 1;

-- Créer le formulaire Collections spécialisées
INSERT INTO public.forms (form_key, form_name, module, description)
VALUES ('legal_deposit_special_collections', 'Dépôt légal - Collections spécialisées', 'special_collections', 'Formulaire de dépôt légal pour les collections spécialisées (cartes, partitions, affiches, etc.)');

-- Créer la version
INSERT INTO public.form_versions (form_id, version_number, is_published, structure)
SELECT id, 1, true,
  jsonb_build_array(
    jsonb_build_object('key', 'collection_info', 'title_fr', 'Identification de la Collection', 'title_ar', 'تعريف المجموعة', 'order', 1),
    jsonb_build_object('key', 'responsible_info', 'title_fr', 'Identification du Responsable', 'title_ar', 'تعريف المسؤول', 'order', 2),
    jsonb_build_object('key', 'publisher_info', 'title_fr', 'Identification de l''Éditeur', 'title_ar', 'تعريف الناشر', 'order', 3),
    jsonb_build_object('key', 'content_description', 'title_fr', 'Description du Contenu', 'title_ar', 'وصف المحتوى', 'order', 4),
    jsonb_build_object('key', 'required_documents', 'title_fr', 'Documents Requis', 'title_ar', 'الوثائق المطلوبة', 'order', 5)
  )
FROM public.forms WHERE form_key = 'legal_deposit_special_collections';

-- Champs Collections spécialisées
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'collection_info', 'collection_title', 'text', 'Titre de la collection', 'عنوان المجموعة', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index, config)
SELECT fv.id, 'collection_info', 'collection_type', 'select', 'Type de collection', 'نوع المجموعة', true, 2,
  jsonb_build_object('options', jsonb_build_array(
    jsonb_build_object('value', 'cartes_geographiques', 'label_fr', 'Cartes géographiques', 'label_ar', 'خرائط جغرافية'),
    jsonb_build_object('value', 'partitions_musicales', 'label_fr', 'Partitions musicales', 'label_ar', 'نوتات موسيقية'),
    jsonb_build_object('value', 'affiches', 'label_fr', 'Affiches', 'label_ar', 'ملصقات'),
    jsonb_build_object('value', 'cartes_postales', 'label_fr', 'Cartes postales', 'label_ar', 'بطاقات بريدية'),
    jsonb_build_object('value', 'photographies', 'label_fr', 'Photographies', 'label_ar', 'صور فوتوغرافية'),
    jsonb_build_object('value', 'estampes', 'label_fr', 'Estampes', 'label_ar', 'مطبوعات فنية'),
    jsonb_build_object('value', 'autres', 'label_fr', 'Autres', 'label_ar', 'أخرى')
  ))
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'collection_info', 'collection_description', 'textarea', 'Description de la collection', 'وصف المجموعة', true, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'collection_info', 'number_of_items', 'number', 'Nombre d''éléments', 'عدد العناصر', true, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'collection_info', 'publication_date', 'date', 'Date de publication', 'تاريخ النشر', true, 5
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'responsible_info', 'responsible_name', 'text', 'Nom du responsable', 'اسم المسؤول', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'responsible_info', 'responsible_function', 'text', 'Fonction', 'الوظيفة', false, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'responsible_info', 'responsible_email', 'text', 'Email', 'البريد الإلكتروني', true, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'responsible_info', 'responsible_phone', 'text', 'Téléphone', 'الهاتف', false, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_name', 'text', 'Nom de l''éditeur/institution', 'اسم الناشر/المؤسسة', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_address', 'textarea', 'Adresse complète', 'العنوان الكامل', true, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_phone', 'text', 'Téléphone', 'الهاتف', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'publisher_info', 'publisher_email', 'text', 'Email', 'البريد الإلكتروني', true, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'content_description', 'theme', 'text', 'Thème principal', 'الموضوع الرئيسي', false, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'content_description', 'period', 'text', 'Période couverte', 'الفترة المشمولة', false, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'content_description', 'geographic_coverage', 'text', 'Couverture géographique', 'التغطية الجغرافية', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'content_description', 'keywords', 'text', 'Mots-clés', 'الكلمات المفتاحية', false, 4
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'collection_samples', 'file', 'Échantillons de la collection (3-5 éléments représentatifs)', 'عينات من المجموعة (3-5 عناصر تمثيلية)', true, 1
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'inventory_list', 'file', 'Liste d''inventaire complète', 'قائمة الجرد الكاملة', true, 2
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, is_required, order_index)
SELECT fv.id, 'required_documents', 'responsible_id', 'file', 'Copie de la pièce d''identité du responsable', 'نسخة من بطاقة هوية المسؤول', false, 3
FROM public.form_versions fv JOIN public.forms f ON f.id = fv.form_id WHERE f.form_key = 'legal_deposit_special_collections' AND fv.version_number = 1;