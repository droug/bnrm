-- Corriger les champs de nationalité pour les formulaires BD/Software et Collections spécialisées

-- 1. Supprimer les anciens champs avec les mauvaises sections
DELETE FROM custom_fields 
WHERE field_key IN ('author_nationality', 'responsible_nationality')
AND form_version_id IN (
  SELECT fv.id 
  FROM form_versions fv
  JOIN forms f ON fv.form_id = f.id
  WHERE f.form_key IN ('legal_deposit_bd_software', 'legal_deposit_special_collections')
);

-- 2. Réinsérer le champ author_nationality pour legal_deposit_bd_software avec la bonne section
INSERT INTO custom_fields (
  form_version_id,
  field_key,
  section_key,
  field_type,
  label_fr,
  label_ar,
  is_required,
  order_index,
  config
)
SELECT 
  fv.id,
  'author_nationality',
  'author_info',
  'autocomplete',
  'Nationalité de l''auteur',
  'جنسية المؤلف',
  false,
  40,
  '{"source": "countries"}'::jsonb
FROM form_versions fv
JOIN forms f ON fv.form_id = f.id
WHERE f.form_key = 'legal_deposit_bd_software'
AND fv.is_published = true;

-- 3. Insérer le champ responsible_nationality pour legal_deposit_special_collections avec la bonne section
INSERT INTO custom_fields (
  form_version_id,
  field_key,
  section_key,
  field_type,
  label_fr,
  label_ar,
  is_required,
  order_index,
  config
)
SELECT 
  fv.id,
  'responsible_nationality',
  'responsible_info',
  'autocomplete',
  'Nationalité du responsable',
  'جنسية المسؤول',
  false,
  40,
  '{"source": "countries"}'::jsonb
FROM form_versions fv
JOIN forms f ON fv.form_id = f.id
WHERE f.form_key = 'legal_deposit_special_collections'
AND fv.is_published = true;