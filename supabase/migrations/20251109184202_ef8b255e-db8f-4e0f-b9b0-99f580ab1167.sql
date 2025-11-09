-- Supprimer le champ "Nationalité du responsable" (doublon)
DELETE FROM custom_fields
WHERE field_key = 'responsible_nationality'
AND id = '5b3b05a0-d3c7-40ff-a876-b1dd075e9b6d';