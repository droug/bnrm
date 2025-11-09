-- Corriger la section du champ author_nationality pour legal_deposit_bd_software
UPDATE custom_fields 
SET section_key = 'identification_auteur'
WHERE field_key = 'author_nationality' 
AND form_version_id IN (
  SELECT fv.id 
  FROM form_versions fv
  JOIN forms f ON fv.form_id = f.id
  WHERE f.form_key = 'legal_deposit_bd_software'
);