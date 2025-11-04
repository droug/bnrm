-- Corriger la structure pour BD et Logiciels
UPDATE public.form_versions
SET structure = jsonb_build_object(
  'sections', jsonb_build_array(
    jsonb_build_object('key', 'author_info', 'label_fr', 'Identification de l''Auteur/Créateur', 'label_ar', 'تعريف المؤلف/المبدع'),
    jsonb_build_object('key', 'work_info', 'label_fr', 'Identification de l''Œuvre', 'label_ar', 'تعريف العمل'),
    jsonb_build_object('key', 'publisher_info', 'label_fr', 'Identification de l''Éditeur', 'label_ar', 'تعريف الناشر'),
    jsonb_build_object('key', 'producer_info', 'label_fr', 'Identification du Producteur', 'label_ar', 'تعريف المنتج'),
    jsonb_build_object('key', 'required_documents', 'label_fr', 'Documents Requis', 'label_ar', 'الوثائق المطلوبة')
  )
)
WHERE form_id = (SELECT id FROM public.forms WHERE form_key = 'legal_deposit_bd_software');

-- Corriger la structure pour Collections spécialisées
UPDATE public.form_versions
SET structure = jsonb_build_object(
  'sections', jsonb_build_array(
    jsonb_build_object('key', 'collection_info', 'label_fr', 'Identification de la Collection', 'label_ar', 'تعريف المجموعة'),
    jsonb_build_object('key', 'responsible_info', 'label_fr', 'Identification du Responsable', 'label_ar', 'تعريف المسؤول'),
    jsonb_build_object('key', 'publisher_info', 'label_fr', 'Identification de l''Éditeur', 'label_ar', 'تعريف الناشر'),
    jsonb_build_object('key', 'content_description', 'label_fr', 'Description du Contenu', 'label_ar', 'وصف المحتوى'),
    jsonb_build_object('key', 'required_documents', 'label_fr', 'Documents Requis', 'label_ar', 'الوثائق المطلوبة')
  )
)
WHERE form_id = (SELECT id FROM public.forms WHERE form_key = 'legal_deposit_special_collections');