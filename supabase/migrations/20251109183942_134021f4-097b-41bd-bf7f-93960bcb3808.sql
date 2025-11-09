-- Corriger la configuration du champ responsible_nationality
UPDATE custom_fields
SET config = '{"list_code": "nationalities"}'::jsonb
WHERE field_key = 'responsible_nationality'
AND field_type = 'autocomplete';