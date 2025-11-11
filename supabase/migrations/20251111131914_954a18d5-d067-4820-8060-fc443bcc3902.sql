-- Activer la liste déroulante du champ "Type de l'auteur" en ajoutant les options
UPDATE custom_fields
SET config = jsonb_set(
  config,
  '{options}',
  '["Personne physique", "Personne morale (collectivités)"]'::jsonb
),
updated_at = now()
WHERE field_key = 'author_type'
AND form_version_id = (
  SELECT fv.id 
  FROM form_versions fv
  JOIN forms f ON fv.form_id = f.id
  WHERE f.form_key = 'legal_deposit_monograph'
  ORDER BY fv.version_number DESC
  LIMIT 1
);