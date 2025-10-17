-- Insertion de données de test pour les demandes professionnelles (version corrigée)

-- 1. Créer des invitations de test
INSERT INTO professional_invitations (email, professional_type, last_deposit_number, status, invited_at, expires_at)
VALUES 
  ('editeur.test@example.com', 'editor', 'DL-2025-000123', 'used', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),
  ('imprimeur.test@example.com', 'printer', 'DL-2025-000456', 'used', NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),
  ('producteur.test@example.com', 'producer', 'DL-2025-000789', 'used', NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),
  ('distributeur.test@example.com', 'distributor', 'DL-2025-000321', 'pending', NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),
  ('editeur2.test@example.com', 'editor', 'DL-2025-000654', 'used', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- 2. Créer des demandes d'inscription avec statut PENDING (3 demandes à traiter)
INSERT INTO professional_registration_requests (
  user_id,
  invitation_id,
  professional_type,
  company_name,
  verified_deposit_number,
  cndp_acceptance,
  status,
  registration_data,
  created_at
)
SELECT 
  auth.uid(),
  pi.id,
  pi.professional_type,
  'Éditions Al Madariss',
  pi.last_deposit_number,
  true,
  'pending',
  jsonb_build_object(
    'address', 'Avenue Mohammed V, Rabat',
    'phone', '+212 5 37 XX XX XX',
    'ice', 'ICE00' || floor(random() * 1000000000)::text,
    'rc', 'RC' || floor(random() * 100000)::text,
    'observations', 'Demande complète avec tous les documents requis. Maison d''édition spécialisée dans les manuels scolaires.'
  ),
  NOW() - INTERVAL '5 days'
FROM professional_invitations pi
WHERE pi.email = 'editeur.test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO professional_registration_requests (
  user_id,
  invitation_id,
  professional_type,
  company_name,
  verified_deposit_number,
  cndp_acceptance,
  status,
  registration_data,
  created_at
)
SELECT 
  auth.uid(),
  pi.id,
  pi.professional_type,
  'Imprimerie Nationale du Maroc',
  pi.last_deposit_number,
  true,
  'pending',
  jsonb_build_object(
    'address', 'Zone Industrielle Aïn Sebaâ, Casablanca',
    'phone', '+212 5 22 XX XX XX',
    'ice', 'ICE00' || floor(random() * 1000000000)::text,
    'rc', 'RC' || floor(random() * 100000)::text,
    'observations', 'Entreprise existante depuis 1985. Demande de renouvellement.'
  ),
  NOW() - INTERVAL '3 days'
FROM professional_invitations pi
WHERE pi.email = 'imprimeur.test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO professional_registration_requests (
  user_id,
  invitation_id,
  professional_type,
  company_name,
  verified_deposit_number,
  cndp_acceptance,
  status,
  registration_data,
  created_at
)
SELECT 
  auth.uid(),
  pi.id,
  pi.professional_type,
  'Éditions Universitaires du Maghreb',
  pi.last_deposit_number,
  true,
  'pending',
  jsonb_build_object(
    'address', 'Avenue des FAR, Fès',
    'phone', '+212 5 35 XX XX XX',
    'ice', 'ICE00' || floor(random() * 1000000000)::text,
    'rc', 'RC' || floor(random() * 100000)::text,
    'observations', 'Nouvelle maison d''édition spécialisée dans les ouvrages universitaires et scientifiques'
  ),
  NOW() - INTERVAL '1 day'
FROM professional_invitations pi
WHERE pi.email = 'editeur2.test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 3. Créer une demande APPROVED (validée)
INSERT INTO professional_registration_requests (
  user_id,
  invitation_id,
  professional_type,
  company_name,
  verified_deposit_number,
  cndp_acceptance,
  status,
  registration_data,
  reviewed_by,
  reviewed_at,
  created_at
)
SELECT 
  auth.uid(),
  pi.id,
  pi.professional_type,
  'Productions Culturelles Atlas',
  pi.last_deposit_number,
  true,
  'approved',
  jsonb_build_object(
    'address', 'Boulevard Zerktouni, Marrakech',
    'phone', '+212 5 24 XX XX XX',
    'ice', 'ICE00' || floor(random() * 1000000000)::text,
    'rc', 'RC' || floor(random() * 100000)::text,
    'observations', 'Spécialisé dans la production audiovisuelle et documentaires culturels.'
  ),
  auth.uid(),
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '7 days'
FROM professional_invitations pi
WHERE pi.email = 'producteur.test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Créer une demande REJECTED (refusée avec raison)
INSERT INTO professional_registration_requests (
  user_id,
  invitation_id,
  professional_type,
  company_name,
  verified_deposit_number,
  cndp_acceptance,
  status,
  registration_data,
  reviewed_by,
  reviewed_at,
  rejection_reason,
  created_at
)
SELECT 
  auth.uid(),
  pi.id,
  pi.professional_type,
  'Distribution Livre Maghreb',
  pi.last_deposit_number,
  false,
  'rejected',
  jsonb_build_object(
    'address', 'Rue de Fès, Rabat',
    'phone', '+212 5 37 XX XX XX',
    'ice', 'ICE00' || floor(random() * 1000000000)::text,
    'rc', 'RC' || floor(random() * 100000)::text,
    'observations', 'Documents soumis mais qualité insuffisante'
  ),
  auth.uid(),
  NOW() - INTERVAL '1 day',
  'Documents incomplets : le registre de commerce fourni n''est pas lisible et la copie de la CIN est expirée. Veuillez soumettre des documents valides et certifiés conformes.',
  NOW() - INTERVAL '2 days'
FROM professional_invitations pi
WHERE pi.email = 'distributeur.test@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. Ajouter des documents de test simulés (avec statut pending car verified n'existe pas)
INSERT INTO professional_registration_documents (
  user_id,
  invitation_id,
  document_type,
  file_name,
  file_url,
  mime_type,
  file_size_kb,
  verification_status
)
SELECT 
  auth.uid(),
  pi.id,
  'identity_card',
  'CIN_proprietaire.pdf',
  'https://via.placeholder.com/400x600/8B1B1B/FFFFFF?text=CIN+Proprietaire',
  'application/pdf',
  245,
  'pending'
FROM professional_invitations pi
WHERE pi.email IN ('editeur.test@example.com', 'imprimeur.test@example.com', 'producteur.test@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO professional_registration_documents (
  user_id,
  invitation_id,
  document_type,
  file_name,
  file_url,
  mime_type,
  file_size_kb,
  verification_status
)
SELECT 
  auth.uid(),
  pi.id,
  'business_license',
  'Registre_Commerce.pdf',
  'https://via.placeholder.com/600x800/004080/FFFFFF?text=Registre+de+Commerce',
  'application/pdf',
  512,
  'pending'
FROM professional_invitations pi
WHERE pi.email IN ('editeur.test@example.com', 'imprimeur.test@example.com', 'producteur.test@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO professional_registration_documents (
  user_id,
  invitation_id,
  document_type,
  file_name,
  file_url,
  mime_type,
  file_size_kb,
  verification_status
)
SELECT 
  auth.uid(),
  pi.id,
  'professional_certificate',
  'Certificat_Professionnel_CNDP.pdf',
  'https://via.placeholder.com/600x800/2D7A2D/FFFFFF?text=Certificat+CNDP',
  'application/pdf',
  189,
  'pending'
FROM professional_invitations pi
WHERE pi.email IN ('editeur.test@example.com', 'producteur.test@example.com')
ON CONFLICT DO NOTHING;