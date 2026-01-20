-- Synchroniser les professionnels déjà approuvés dans leurs tables respectives

-- Éditeurs (editor → publishers)
INSERT INTO public.publishers (id, name, city, country, address, phone, email, google_maps_link, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  company_name,
  (registration_data->>'city')::text,
  COALESCE((registration_data->>'country')::text, 'Maroc'),
  (registration_data->>'address')::text,
  (registration_data->>'phone')::text,
  COALESCE((registration_data->>'email')::text, (registration_data->>'contact_email')::text),
  (registration_data->>'google_maps_link')::text,
  NOW(),
  NOW()
FROM public.professional_registration_requests
WHERE professional_type = 'editor' 
  AND status = 'approved'
  AND company_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.publishers p WHERE lower(p.name) = lower(company_name)
  );

-- Imprimeurs (printer → printers)
INSERT INTO public.printers (id, name, city, country, address, phone, email, google_maps_link, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  company_name,
  (registration_data->>'city')::text,
  COALESCE((registration_data->>'country')::text, 'Maroc'),
  (registration_data->>'address')::text,
  (registration_data->>'phone')::text,
  COALESCE((registration_data->>'email')::text, (registration_data->>'contact_email')::text),
  (registration_data->>'google_maps_link')::text,
  NOW(),
  NOW()
FROM public.professional_registration_requests
WHERE professional_type = 'printer' 
  AND status = 'approved'
  AND company_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.printers p WHERE lower(p.name) = lower(company_name)
  );

-- Producteurs (producer → producers)
INSERT INTO public.producers (id, name, city, country, address, phone, email, google_maps_link, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  company_name,
  (registration_data->>'city')::text,
  COALESCE((registration_data->>'country')::text, 'Maroc'),
  (registration_data->>'address')::text,
  (registration_data->>'phone')::text,
  COALESCE((registration_data->>'email')::text, (registration_data->>'contact_email')::text),
  (registration_data->>'google_maps_link')::text,
  NOW(),
  NOW()
FROM public.professional_registration_requests
WHERE professional_type = 'producer' 
  AND status = 'approved'
  AND company_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.producers p WHERE lower(p.name) = lower(company_name)
  );

-- Distributeurs (distributor → distributors)
INSERT INTO public.distributors (id, name, city, country, address, phone, email, google_maps_link, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  company_name,
  (registration_data->>'city')::text,
  COALESCE((registration_data->>'country')::text, 'Maroc'),
  (registration_data->>'address')::text,
  (registration_data->>'phone')::text,
  COALESCE((registration_data->>'email')::text, (registration_data->>'contact_email')::text),
  (registration_data->>'google_maps_link')::text,
  NOW(),
  NOW()
FROM public.professional_registration_requests
WHERE professional_type = 'distributor' 
  AND status = 'approved'
  AND company_name IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.distributors p WHERE lower(p.name) = lower(company_name)
  );