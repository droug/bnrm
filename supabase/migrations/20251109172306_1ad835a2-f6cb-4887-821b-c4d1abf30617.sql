-- Ajouter "autocomplete" comme type de champ autorisé
ALTER TABLE public.custom_fields DROP CONSTRAINT IF EXISTS custom_fields_field_type_check;

ALTER TABLE public.custom_fields 
ADD CONSTRAINT custom_fields_field_type_check 
CHECK (field_type IN (
  'text', 'textarea', 'select', 'multiselect', 'date', 'number', 
  'boolean', 'link', 'location', 'coordinates', 'reference', 
  'file', 'group', 'autocomplete'
));

-- Insérer tous les champs du formulaire legal_deposit_monograph
-- Section 1: Identification de l'auteur
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_auteur', 'author_type', 'select', 'Type de l''auteur', 'نوع المؤلف', 0, true, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph'
ON CONFLICT DO NOTHING;

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_auteur', 'author_name', 'text', 'Nom de l''auteur', 'اسم المؤلف', 1, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_auteur', 'author_pseudonym', 'text', 'Pseudonyme', 'الاسم المستعار', 2, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_auteur', 'author_nationality', 'autocomplete', 'Nationalité', 'الجنسية', 3, false, true, false, '{"list_code": "nationalities"}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_auteur', 'author_phone', 'text', 'Téléphone', 'الهاتف', 4, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_auteur', 'author_email', 'text', 'Email', 'البريد الإلكتروني', 5, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_auteur', 'author_region', 'select', 'Région', 'المنطقة', 6, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_auteur', 'author_city', 'select', 'Ville', 'المدينة', 7, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

-- Section 2: Identification de la publication
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_publication', 'publication_discipline', 'select', 'Discipline de l''ouvrage', 'تخصص الكتاب', 0, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_publication', 'publication_title', 'text', 'Titre de l''ouvrage', 'عنوان الكتاب', 1, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_publication', 'support_type', 'select', 'Type de support', 'نوع الوسيط', 2, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_publication', 'publication_type', 'select', 'Type de publication', 'نوع النشر', 3, true, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_publication', 'is_periodic', 'select', 'Périodicité', 'الدورية', 4, true, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_publication', 'collection_title', 'text', 'Titre de la collection', 'عنوان السلسلة', 5, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_publication', 'collection_number', 'text', 'Numéro dans la collection', 'الرقم في السلسلة', 6, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_publication', 'number_of_pages', 'number', 'Nombre de pages', 'عدد الصفحات', 7, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

-- Section 3: Identification de l'Éditeur
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_editeur', 'publisher_id', 'select', 'Éditeur', 'الناشر', 0, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_editeur', 'publication_date', 'date', 'Date prévue de parution', 'تاريخ النشر المتوقع', 1, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

-- Section 4: Identification de l'imprimeur
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_imprimeur', 'printer_id', 'select', 'Imprimerie', 'المطبعة', 0, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_imprimeur', 'printer_email', 'text', 'Email', 'البريد الإلكتروني', 1, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly, config)
SELECT fv.id, 'identification_imprimeur', 'printer_country', 'select', 'Pays', 'البلد', 2, false, true, false, '{"options": []}'::jsonb
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_imprimeur', 'printer_phone', 'text', 'Téléphone', 'الهاتف', 3, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_imprimeur', 'printer_address', 'textarea', 'Adresse', 'العنوان', 4, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'identification_imprimeur', 'print_run_number', 'number', 'Nombre de tirage', 'عدد النسخ المطبوعة', 5, false, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

-- Section 5: Pièces à fournir
INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'pieces_fournir', 'cover_file', 'file', 'Joindre la couverture (format « jpg » moins de 1 MO)', 'إرفاق الغلاف', 0, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'pieces_fournir', 'summary_file', 'file', 'Joindre le sommaire (format « PDF » moins de 2 MO)', 'إرفاق الفهرس', 1, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'pieces_fournir', 'abstract_file', 'file', 'Joindre résumé de l''ouvrage (format « PDF » moins de 2 MO)', 'إرفاق ملخص الكتاب', 2, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';

INSERT INTO public.custom_fields (form_version_id, section_key, field_key, field_type, label_fr, label_ar, order_index, is_required, is_visible, is_readonly)
SELECT fv.id, 'pieces_fournir', 'cin_file', 'file', 'Envoyer une copie de la CIN du directeur', 'إرسال نسخة من البطاقة الوطنية', 3, true, true, false
FROM form_versions fv JOIN forms f ON fv.form_id = f.id WHERE f.form_key = 'legal_deposit_monograph';