-- Supprimer le doublon du champ author_nationality avec la mauvaise section_key
DELETE FROM custom_fields 
WHERE field_key = 'author_nationality' 
AND section_key = 'author_info';