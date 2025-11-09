-- Ajouter le champ author_nationality dans le formulaire Bases de données/Logiciels
INSERT INTO custom_fields (
  form_version_id,
  section_key,
  field_key,
  field_type,
  label_fr,
  label_ar,
  order_index,
  is_required,
  is_visible,
  config
) VALUES (
  '3d5ddc8c-243b-44f0-8702-2508f6b6c8e4',
  'identification_auteur',
  'author_nationality',
  'autocomplete',
  'Nationalité',
  'الجنسية',
  3,
  false,
  true,
  '{"list_code": "nationalities"}'::jsonb
);

-- Ajouter le champ author_nationality dans le formulaire Collections spécialisées
INSERT INTO custom_fields (
  form_version_id,
  section_key,
  field_key,
  field_type,
  label_fr,
  label_ar,
  order_index,
  is_required,
  is_visible,
  config
) VALUES (
  '9057814f-8696-4c6f-884d-0d8ccb4f80ea',
  'identification_auteur',
  'author_nationality',
  'autocomplete',
  'Nationalité',
  'الجنسية',
  3,
  false,
  true,
  '{"list_code": "nationalities"}'::jsonb
);