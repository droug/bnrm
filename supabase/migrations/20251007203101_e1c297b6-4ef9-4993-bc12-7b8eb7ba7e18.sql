-- Insérer des demandes d'accès avec les ID de profils (pas auth.users)
INSERT INTO access_requests (
  user_id,
  manuscript_id,
  request_type,
  purpose,
  requested_date,
  status,
  notes,
  created_at
) VALUES
(
  '5e1c70b5-b736-4ea5-85bc-7ff37928528b',
  'd55ca7b4-cbc3-4690-86b4-d5844e9a14c1',
  'consultation',
  'Recherche académique sur les manuscrits médiévaux',
  CURRENT_DATE,
  'pending',
  'Demande urgente pour projet de thèse',
  NOW() - INTERVAL '2 days'
),
(
  'ca78fe76-cf20-4cad-81a4-e51dc9b8ae7f',
  '08c910d8-d34e-4465-bcb3-c05d2fe9b320',
  'reproduction',
  'Publication dans revue scientifique',
  CURRENT_DATE,
  'pending',
  'Besoin de reproduction haute qualité',
  NOW() - INTERVAL '5 days'
),
(
  '44824738-814b-4aad-97bf-11d193a06d5d',
  '23a8cf7a-cc91-4a78-a79b-fec482f5f6b1',
  'research',
  'Étude comparative des textes religieux',
  CURRENT_DATE - INTERVAL '1 day',
  'pending',
  'Accès prolongé souhaité',
  NOW() - INTERVAL '1 day'
),
(
  '64f3c965-9b6a-4507-a837-a0189a379da8',
  'c8824249-4050-4f6a-a7e7-239a411c6f17',
  'consultation',
  'Documentation pour exposition',
  CURRENT_DATE - INTERVAL '10 days',
  'approved',
  'Approuvée par le bibliothécaire en chef',
  NOW() - INTERVAL '15 days'
)
ON CONFLICT DO NOTHING;