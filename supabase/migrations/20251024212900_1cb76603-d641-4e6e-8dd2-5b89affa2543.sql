-- Ajouter des exemples de dates bloquées pour les espaces culturels
-- Pour l'Auditorium
INSERT INTO space_availability (
  space_id,
  start_date,
  end_date,
  is_blocked,
  reason
)
SELECT 
  id,
  '2025-11-05T00:00:00+00:00'::timestamp with time zone,
  '2025-11-05T23:59:59+00:00'::timestamp with time zone,
  true,
  'Événement spécial - Réservé'
FROM cultural_spaces
WHERE name = 'Auditorium'

UNION ALL

SELECT 
  id,
  '2025-11-15T00:00:00+00:00'::timestamp with time zone,
  '2025-11-16T23:59:59+00:00'::timestamp with time zone,
  true,
  'Maintenance programmée'
FROM cultural_spaces
WHERE name = 'Auditorium'

UNION ALL

SELECT 
  id,
  '2025-11-22T00:00:00+00:00'::timestamp with time zone,
  '2025-11-22T23:59:59+00:00'::timestamp with time zone,
  true,
  'Conférence internationale'
FROM cultural_spaces
WHERE name = 'Auditorium'

UNION ALL

-- Pour la Grande salle d'exposition
SELECT 
  id,
  '2025-11-08T00:00:00+00:00'::timestamp with time zone,
  '2025-11-10T23:59:59+00:00'::timestamp with time zone,
  true,
  'Exposition en cours'
FROM cultural_spaces
WHERE name = 'Grande salle d''exposition'

UNION ALL

SELECT 
  id,
  '2025-11-20T00:00:00+00:00'::timestamp with time zone,
  '2025-11-21T23:59:59+00:00'::timestamp with time zone,
  true,
  'Vernissage privé'
FROM cultural_spaces
WHERE name = 'Grande salle d''exposition'

UNION ALL

-- Pour la Salle séminaire
SELECT 
  id,
  '2025-11-12T00:00:00+00:00'::timestamp with time zone,
  '2025-11-13T23:59:59+00:00'::timestamp with time zone,
  true,
  'Séminaire de formation'
FROM cultural_spaces
WHERE name = 'Salle séminaire'

UNION ALL

SELECT 
  id,
  '2025-11-25T00:00:00+00:00'::timestamp with time zone,
  '2025-11-25T23:59:59+00:00'::timestamp with time zone,
  true,
  'Réunion stratégique'
FROM cultural_spaces
WHERE name = 'Salle séminaire'

UNION ALL

-- Pour la Salle de réunion
SELECT 
  id,
  '2025-11-07T00:00:00+00:00'::timestamp with time zone,
  '2025-11-07T23:59:59+00:00'::timestamp with time zone,
  true,
  'Réunion mensuelle'
FROM cultural_spaces
WHERE name = 'Salle de réunion'

UNION ALL

SELECT 
  id,
  '2025-11-18T00:00:00+00:00'::timestamp with time zone,
  '2025-11-19T23:59:59+00:00'::timestamp with time zone,
  true,
  'Atelier de travail'
FROM cultural_spaces
WHERE name = 'Salle de réunion'

UNION ALL

-- Pour la Salle de l'annexe
SELECT 
  id,
  '2025-11-14T00:00:00+00:00'::timestamp with time zone,
  '2025-11-14T23:59:59+00:00'::timestamp with time zone,
  true,
  'Événement culturel'
FROM cultural_spaces
WHERE name = 'Salle de l''annexe'

UNION ALL

SELECT 
  id,
  '2025-11-28T00:00:00+00:00'::timestamp with time zone,
  '2025-11-29T23:59:59+00:00'::timestamp with time zone,
  true,
  'Répétition générale'
FROM cultural_spaces
WHERE name = 'Salle de l''annexe';