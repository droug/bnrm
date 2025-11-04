-- Créer le formulaire pour les publications périodiques
INSERT INTO public.forms (form_key, form_name, description, module, is_active)
VALUES (
  'legal_deposit_periodical',
  'Dépôt légal - Publications Périodiques',
  'Formulaire de déclaration de dépôt légal pour les publications périodiques',
  'periodiques',
  true
);

-- Créer la version avec les sections
INSERT INTO public.form_versions (form_id, version_number, structure, is_published)
SELECT 
  id,
  1,
  jsonb_build_object(
    'sections', jsonb_build_array(
      jsonb_build_object(
        'key', 'director_info',
        'label_fr', 'Informations sur le directeur',
        'label_ar', 'معلومات المدير',
        'order_index', 0
      ),
      jsonb_build_object(
        'key', 'publication_info',
        'label_fr', 'Informations sur la publication',
        'label_ar', 'معلومات النشر',
        'order_index', 1
      ),
      jsonb_build_object(
        'key', 'publisher_info',
        'label_fr', 'Informations sur l''éditeur',
        'label_ar', 'معلومات الناشر',
        'order_index', 2
      ),
      jsonb_build_object(
        'key', 'printer_info',
        'label_fr', 'Informations sur l''imprimeur',
        'label_ar', 'معلومات المطبعة',
        'order_index', 3
      ),
      jsonb_build_object(
        'key', 'required_documents',
        'label_fr', 'Documents requis',
        'label_ar', 'الوثائق المطلوبة',
        'order_index', 4
      )
    )
  ),
  true
FROM public.forms
WHERE form_key = 'legal_deposit_periodical';

-- Insérer les champs de base pour chaque section
INSERT INTO public.custom_fields (form_version_id, field_key, field_type, section_key, order_index, label_fr, label_ar, is_required, is_visible, is_readonly)
SELECT 
  fv.id,
  field_data.field_key,
  field_data.field_type,
  field_data.section_key,
  field_data.order_index,
  field_data.label_fr,
  field_data.label_ar,
  field_data.is_required,
  true,
  false
FROM public.form_versions fv
JOIN public.forms f ON fv.form_id = f.id
CROSS JOIN (
  VALUES
    -- Section 1: Informations sur le directeur
    ('director_info', 'director_name', 'text', 0, 'Nom du directeur', 'اسم المدير', true),
    ('director_info', 'director_email', 'text', 1, 'Email', 'البريد الإلكتروني', true),
    ('director_info', 'director_phone', 'text', 2, 'Téléphone', 'الهاتف', true),
    ('director_info', 'director_address', 'textarea', 3, 'Adresse', 'العنوان', false),
    
    -- Section 2: Informations sur la publication
    ('publication_info', 'publication_title', 'text', 0, 'Titre de la publication', 'عنوان النشر', true),
    ('publication_info', 'publication_subtitle', 'text', 1, 'Sous-titre', 'العنوان الفرعي', false),
    ('publication_info', 'issn', 'text', 2, 'ISSN', 'الرقم الدولي المعياري', false),
    ('publication_info', 'periodicity', 'select', 3, 'Périodicité', 'الدورية', true),
    ('publication_info', 'language', 'select', 4, 'Langue de publication', 'لغة النشر', true),
    ('publication_info', 'first_issue_date', 'date', 5, 'Date du premier numéro', 'تاريخ العدد الأول', true),
    
    -- Section 3: Informations sur l'éditeur
    ('publisher_info', 'publisher_name', 'text', 0, 'Nom de l''éditeur', 'اسم الناشر', true),
    ('publisher_info', 'publisher_address', 'textarea', 1, 'Adresse', 'العنوان', false),
    ('publisher_info', 'publisher_phone', 'text', 2, 'Téléphone', 'الهاتف', false),
    ('publisher_info', 'publisher_email', 'text', 3, 'Email', 'البريد الإلكتروني', false),
    
    -- Section 4: Informations sur l'imprimeur
    ('printer_info', 'printer_name', 'text', 0, 'Nom de l''imprimeur', 'اسم المطبعة', true),
    ('printer_info', 'printer_address', 'textarea', 1, 'Adresse', 'العنوان', false),
    ('printer_info', 'printer_country', 'select', 2, 'Pays', 'البلد', true),
    ('printer_info', 'print_run', 'number', 3, 'Tirage', 'عدد النسخ', false),
    
    -- Section 5: Documents requis
    ('required_documents', 'cover_file', 'file', 0, 'Couverture (jpg, max 1MB)', 'الغلاف', true),
    ('required_documents', 'sample_copy', 'file', 1, 'Exemplaire spécimen (PDF)', 'نسخة نموذجية', true),
    ('required_documents', 'director_id', 'file', 2, 'Copie CIN du directeur', 'نسخة بطاقة المدير', true)
) AS field_data(section_key, field_key, field_type, order_index, label_fr, label_ar, is_required)
WHERE f.form_key = 'legal_deposit_periodical';