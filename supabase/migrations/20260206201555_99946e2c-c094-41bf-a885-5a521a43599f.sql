-- Ajouter la colonne platform à la table forms si elle n'existe pas
ALTER TABLE public.forms 
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'bnrm';

-- Créer le formulaire de configuration pour la demande de reproduction
INSERT INTO public.forms (id, form_key, form_name, description, module, platform, is_active)
VALUES (
  gen_random_uuid(),
  'reproduction_request_form',
  'Demande de Reproduction',
  'Configuration des options du formulaire de demande de reproduction',
  'reproduction',
  'bn',
  true
)
ON CONFLICT (form_key) DO NOTHING;

-- Créer la version du formulaire avec les sections
INSERT INTO public.form_versions (id, form_id, version_number, structure, is_published, published_at)
SELECT 
  gen_random_uuid(),
  f.id,
  1,
  jsonb_build_object(
    'sections', jsonb_build_array(
      jsonb_build_object(
        'key', 'type_reproduction',
        'label_fr', 'Type de reproduction',
        'label_ar', 'نوع الاستنساخ',
        'order_index', 0,
        'fields', jsonb_build_array()
      )
    )
  ),
  true,
  now()
FROM public.forms f
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.form_versions fv WHERE fv.form_id = f.id
);

-- Créer les champs pour les options de reproduction
-- Option 1: Copie numérique par email
INSERT INTO public.custom_fields (
  id, form_version_id, field_key, field_type, section_key, order_index, 
  label_fr, label_ar, is_required, is_visible, is_readonly, config
)
SELECT 
  gen_random_uuid(),
  fv.id,
  'numerique_mail',
  'boolean',
  'type_reproduction',
  0,
  'Copie numérique par email (PDF)',
  'نسخة رقمية عبر البريد الإلكتروني',
  false,
  true,
  false,
  jsonb_build_object('value', 'numerique_mail', 'default_enabled', true)
FROM public.forms f
JOIN public.form_versions fv ON fv.form_id = f.id
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.custom_fields cf 
  WHERE cf.form_version_id = fv.id AND cf.field_key = 'numerique_mail'
);

-- Option 2: Copie numérique espace personnel
INSERT INTO public.custom_fields (
  id, form_version_id, field_key, field_type, section_key, order_index, 
  label_fr, label_ar, is_required, is_visible, is_readonly, config
)
SELECT 
  gen_random_uuid(),
  fv.id,
  'numerique_espace',
  'boolean',
  'type_reproduction',
  1,
  'Copie numérique (espace personnel)',
  'نسخة رقمية (المساحة الشخصية)',
  false,
  true,
  false,
  jsonb_build_object('value', 'numerique_espace', 'default_enabled', true)
FROM public.forms f
JOIN public.form_versions fv ON fv.form_id = f.id
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.custom_fields cf 
  WHERE cf.form_version_id = fv.id AND cf.field_key = 'numerique_espace'
);

-- Option 3: Tirage papier
INSERT INTO public.custom_fields (
  id, form_version_id, field_key, field_type, section_key, order_index, 
  label_fr, label_ar, is_required, is_visible, is_readonly, config
)
SELECT 
  gen_random_uuid(),
  fv.id,
  'papier',
  'boolean',
  'type_reproduction',
  2,
  'Tirage papier',
  'طباعة ورقية',
  false,
  true,
  false,
  jsonb_build_object('value', 'papier', 'default_enabled', true)
FROM public.forms f
JOIN public.form_versions fv ON fv.form_id = f.id
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.custom_fields cf 
  WHERE cf.form_version_id = fv.id AND cf.field_key = 'papier'
);

-- Option 4: Duplicata Microfilm
INSERT INTO public.custom_fields (
  id, form_version_id, field_key, field_type, section_key, order_index, 
  label_fr, label_ar, is_required, is_visible, is_readonly, config
)
SELECT 
  gen_random_uuid(),
  fv.id,
  'microfilm',
  'boolean',
  'type_reproduction',
  3,
  'Duplicata Microfilm',
  'نسخة ميكروفيلم',
  false,
  true,
  false,
  jsonb_build_object('value', 'microfilm', 'default_enabled', true)
FROM public.forms f
JOIN public.form_versions fv ON fv.form_id = f.id
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.custom_fields cf 
  WHERE cf.form_version_id = fv.id AND cf.field_key = 'microfilm'
);

-- Option 5: Support physique
INSERT INTO public.custom_fields (
  id, form_version_id, field_key, field_type, section_key, order_index, 
  label_fr, label_ar, is_required, is_visible, is_readonly, config
)
SELECT 
  gen_random_uuid(),
  fv.id,
  'support_physique',
  'boolean',
  'type_reproduction',
  4,
  'Reproduction sur support physique',
  'استنساخ على دعم مادي',
  false,
  true,
  false,
  jsonb_build_object('value', 'support_physique', 'default_enabled', true)
FROM public.forms f
JOIN public.form_versions fv ON fv.form_id = f.id
WHERE f.form_key = 'reproduction_request_form'
AND NOT EXISTS (
  SELECT 1 FROM public.custom_fields cf 
  WHERE cf.form_version_id = fv.id AND cf.field_key = 'support_physique'
);