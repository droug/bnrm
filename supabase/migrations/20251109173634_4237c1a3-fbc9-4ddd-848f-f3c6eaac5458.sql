
-- Ajouter le champ Nationalité pour le formulaire BD/Logiciels
INSERT INTO custom_fields (
  form_version_id,
  section_key,
  field_key,
  field_type,
  label_fr,
  label_ar,
  is_required,
  is_visible,
  is_readonly,
  config,
  order_index
)
SELECT 
  fv.id,
  'identification_auteur',
  'author_nationality',
  'autocomplete',
  'Nationalité',
  'الجنسية',
  false,
  true,
  false,
  '{"list_code": "nationalities"}'::jsonb,
  100
FROM form_versions fv
JOIN forms f ON fv.form_id = f.id
WHERE f.form_key = 'legal_deposit_bd_software'
  AND NOT EXISTS (
    SELECT 1 FROM custom_fields cf 
    WHERE cf.form_version_id = fv.id 
    AND cf.field_key = 'author_nationality'
  );

-- Ajouter le champ Nationalité pour le formulaire Collections spécialisées
INSERT INTO custom_fields (
  form_version_id,
  section_key,
  field_key,
  field_type,
  label_fr,
  label_ar,
  is_required,
  is_visible,
  is_readonly,
  config,
  order_index
)
SELECT 
  fv.id,
  'identification_auteur',
  'author_nationality',
  'autocomplete',
  'Nationalité',
  'الجنسية',
  false,
  true,
  false,
  '{"list_code": "nationalities"}'::jsonb,
  100
FROM form_versions fv
JOIN forms f ON fv.form_id = f.id
WHERE f.form_key = 'legal_deposit_special_collections'
  AND NOT EXISTS (
    SELECT 1 FROM custom_fields cf 
    WHERE cf.form_version_id = fv.id 
    AND cf.field_key = 'author_nationality'
  );
