-- Insérer des demandes fictives de reproduction
INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'numerique_mail',
  'brouillon',
  'Demande de numérisation haute résolution pour analyse paléographique',
  NULL,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  service_validated_at,
  service_validation_notes,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'numerique_espace',
  'soumise',
  'Besoin de reproductions en haute définition pour illustrations d''article scientifique',
  NOW() - INTERVAL '5 days',
  NULL,
  NULL,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  service_validated_at,
  service_validation_notes,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'numerique_mail',
  'en_validation_service',
  'Reproduction en format TIFF non compressé pour archivage long terme',
  NOW() - INTERVAL '10 days',
  NULL,
  NULL,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  service_validated_at,
  manager_validated_at,
  processing_started_at,
  payment_status,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'papier',
  'en_traitement',
  'Reproduction papier pour exposition temporaire',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '20 days',
  'paid',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  service_validated_at,
  manager_validated_at,
  processing_started_at,
  processing_completed_at,
  available_at,
  payment_status,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'numerique_mail',
  'terminee',
  'Demande de numérisation pour recherche académique',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '43 days',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '18 days',
  'paid',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '10 days'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

INSERT INTO public.reproduction_requests (
  user_id,
  reproduction_modality,
  status,
  user_notes,
  submitted_at,
  rejection_reason,
  rejected_at,
  created_at,
  updated_at
)
SELECT 
  (SELECT user_id FROM profiles WHERE role = 'admin' LIMIT 1),
  'support_physique',
  'refusee',
  'Demande de reproduction complète d''un manuscrit rare',
  NOW() - INTERVAL '15 days',
  'Document soumis à des restrictions de droits d''auteur - autorisation requise',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '12 days'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'admin');

-- Ajouter des items de reproduction pour certaines demandes
INSERT INTO public.reproduction_items (
  request_id,
  manuscript_id,
  title,
  reference,
  formats,
  pages_specification,
  color_mode,
  resolution_dpi,
  quantity,
  unit_price,
  total_price
)
SELECT 
  r.id,
  (SELECT id FROM manuscripts ORDER BY RANDOM() LIMIT 1),
  'مخطوط الفقه المالكي - Pages 1-15',
  'MS-2024-001',
  ARRAY['pdf']::reproduction_format[],
  '1-15',
  'couleur',
  600,
  1,
  5.00,
  75.00
FROM reproduction_requests r
WHERE r.status = 'soumise'
LIMIT 1;

INSERT INTO public.reproduction_items (
  request_id,
  manuscript_id,
  title,
  reference,
  formats,
  pages_specification,
  color_mode,
  resolution_dpi,
  quantity,
  unit_price,
  total_price
)
SELECT 
  r.id,
  (SELECT id FROM manuscripts ORDER BY RANDOM() LIMIT 1),
  'Histoire du Maroc - Document complet',
  'MS-2024-002',
  ARRAY['tiff']::reproduction_format[],
  'Document complet',
  'couleur',
  600,
  1,
  120.00,
  120.00
FROM reproduction_requests r
WHERE r.status = 'en_validation_service'
LIMIT 1;

INSERT INTO public.reproduction_items (
  request_id,
  manuscript_id,
  title,
  reference,
  formats,
  pages_specification,
  color_mode,
  resolution_dpi,
  quantity,
  unit_price,
  total_price
)
SELECT 
  r.id,
  (SELECT id FROM manuscripts ORDER BY RANDOM() LIMIT 1),
  'ديوان الشعر الأندلسي - Pages 5-12',
  'MS-2024-003',
  ARRAY['jpeg']::reproduction_format[],
  '5-12',
  'couleur',
  300,
  8,
  10.00,
  80.00
FROM reproduction_requests r
WHERE r.status = 'en_traitement'
LIMIT 1;

INSERT INTO public.reproduction_items (
  request_id,
  manuscript_id,
  title,
  reference,
  formats,
  pages_specification,
  color_mode,
  resolution_dpi,
  quantity,
  unit_price,
  total_price
)
SELECT 
  r.id,
  (SELECT id FROM manuscripts ORDER BY RANDOM() LIMIT 1),
  'Traité de Médecine Traditionnelle - Pages sélectionnées',
  'MS-2024-004',
  ARRAY['pdf', 'jpeg']::reproduction_format[],
  '1-20, 45-60, 80-95',
  'couleur',
  600,
  1,
  8.00,
  280.00
FROM reproduction_requests r
WHERE r.status = 'terminee'
LIMIT 1;