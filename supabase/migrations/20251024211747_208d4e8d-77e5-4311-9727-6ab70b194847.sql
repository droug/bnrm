-- Créer la liste système pour les espaces culturels
INSERT INTO system_lists (
  list_code,
  list_name,
  description,
  module,
  form_name,
  field_type,
  is_hierarchical,
  is_active
) VALUES (
  'ESPACE_CULTUREL',
  'Espaces culturels',
  'Liste des espaces culturels disponibles pour réservation',
  'Activités culturelles',
  'Réservation d''espace',
  'simple',
  false,
  true
);

-- Ajouter les valeurs de la liste (espaces culturels)
INSERT INTO system_list_values (
  list_id,
  value_code,
  value_label,
  sort_order,
  is_active
) 
SELECT 
  sl.id,
  'auditorium',
  'Auditorium',
  1,
  true
FROM system_lists sl
WHERE sl.list_code = 'ESPACE_CULTUREL'

UNION ALL

SELECT 
  sl.id,
  'grande_salle',
  'Grande salle d''exposition',
  2,
  true
FROM system_lists sl
WHERE sl.list_code = 'ESPACE_CULTUREL'

UNION ALL

SELECT 
  sl.id,
  'salle_seminaire',
  'Salle séminaire',
  3,
  true
FROM system_lists sl
WHERE sl.list_code = 'ESPACE_CULTUREL'

UNION ALL

SELECT 
  sl.id,
  'salle_reunion',
  'Salle de réunion',
  4,
  true
FROM system_lists sl
WHERE sl.list_code = 'ESPACE_CULTUREL'

UNION ALL

SELECT 
  sl.id,
  'salle_annexe',
  'Salle de l''annexe',
  5,
  true
FROM system_lists sl
WHERE sl.list_code = 'ESPACE_CULTUREL';