-- Peupler les formulaires configurables avec les formulaires existants

-- Plateforme BNRM
INSERT INTO public.configurable_forms (platform, module, form_name, form_key) VALUES
('bnrm', 'services', 'Inscription aux services BNRM', 'service_registration'),
('bnrm', 'services', 'Réservation de box', 'box_reservation'),
('bnrm', 'reservations', 'Réservation d''ouvrage', 'book_reservation'),
('bnrm', 'reservations', 'Demande de réservation', 'reservation_request'),
('bnrm', 'numerisation', 'Demande de numérisation', 'digitization_request')
ON CONFLICT (platform, module, form_key) DO NOTHING;

-- Plateforme Dépôt Légal
INSERT INTO public.configurable_forms (platform, module, form_name, form_key) VALUES
('depot_legal', 'monographies', 'Dépôt légal - Monographie', 'legal_deposit_monograph'),
('depot_legal', 'periodiques', 'Dépôt légal - Périodique', 'legal_deposit_periodical'),
('depot_legal', 'theses', 'Dépôt légal - Thèse', 'legal_deposit_thesis'),
('depot_legal', 'audiovisuel', 'Dépôt légal - Audiovisuel', 'legal_deposit_audiovisual'),
('depot_legal', 'partitions', 'Dépôt légal - Partition musicale', 'legal_deposit_music'),
('depot_legal', 'cartes', 'Dépôt légal - Cartes et plans', 'legal_deposit_maps'),
('depot_legal', 'professionnel', 'Inscription professionnelle', 'professional_registration')
ON CONFLICT (platform, module, form_key) DO NOTHING;

-- Plateforme Bibliothèque Numérique
INSERT INTO public.configurable_forms (platform, module, form_name, form_key) VALUES
('bn', 'acces', 'Demande d''accès manuscrit', 'manuscript_access_request'),
('bn', 'reproduction', 'Demande de reproduction', 'reproduction_request'),
('bn', 'restauration', 'Demande de restauration', 'restoration_request')
ON CONFLICT (platform, module, form_key) DO NOTHING;

-- Plateforme Activités Culturelles
INSERT INTO public.configurable_forms (platform, module, form_name, form_key) VALUES
('activites_culturelles', 'visites', 'Réservation visite guidée', 'guided_tour_booking'),
('activites_culturelles', 'expositions', 'Réservation espace exposition', 'exhibition_space_booking'),
('activites_culturelles', 'partenariats', 'Demande de partenariat', 'partnership_request'),
('activites_culturelles', 'programmes', 'Contribution programme culturel', 'program_contribution')
ON CONFLICT (platform, module, form_key) DO NOTHING;

-- Plateforme CBN (Catalogage Bibliographique National)
INSERT INTO public.configurable_forms (platform, module, form_name, form_key) VALUES
('cbn', 'catalogage', 'Notice bibliographique', 'bibliographic_record'),
('cbn', 'autorites', 'Notice d''autorité', 'authority_record'),
('cbn', 'import', 'Import de notices', 'bulk_import')
ON CONFLICT (platform, module, form_key) DO NOTHING;

-- Créer les versions initiales pour chaque formulaire
INSERT INTO public.form_versions (form_id, version_number, structure, is_published, created_by)
SELECT 
  id,
  1,
  '{"sections": []}'::jsonb,
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@bnrm.ma' LIMIT 1)
FROM public.configurable_forms
WHERE NOT EXISTS (
  SELECT 1 FROM public.form_versions WHERE form_versions.form_id = configurable_forms.id
);

-- Fonction pour récupérer les formulaires par plateforme
CREATE OR REPLACE FUNCTION get_forms_by_platform(p_platform text)
RETURNS TABLE (
  id uuid,
  platform text,
  module text,
  form_name text,
  form_key text,
  current_version integer
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, platform, module, form_name, form_key, current_version
  FROM configurable_forms
  WHERE platform = p_platform
  ORDER BY module, form_name;
$$;

-- Fonction pour récupérer les modules par plateforme
CREATE OR REPLACE FUNCTION get_modules_by_platform(p_platform text)
RETURNS TABLE (
  module text
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT module
  FROM configurable_forms
  WHERE platform = p_platform
  ORDER BY module;
$$;