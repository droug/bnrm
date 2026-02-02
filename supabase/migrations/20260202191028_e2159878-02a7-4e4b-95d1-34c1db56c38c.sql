-- Re-sync directory validation flags from approved registration requests
-- Goal: Only professionals backed by an approved request should be considered validated.

WITH approved_editors AS (
  SELECT DISTINCT lower(nullif(trim(coalesce(registration_data->>'email', registration_data->>'contact_email')), '')) AS email
  FROM public.professional_registration_requests
  WHERE status = 'approved'
    AND professional_type = 'editor'
),
approved_printers AS (
  SELECT DISTINCT lower(nullif(trim(coalesce(registration_data->>'email', registration_data->>'contact_email')), '')) AS email
  FROM public.professional_registration_requests
  WHERE status = 'approved'
    AND professional_type = 'printer'
)
-- 1) Publishers: mark validated iff email appears in approved editors
UPDATE public.publishers p
SET is_validated = EXISTS (
    SELECT 1
    FROM approved_editors ae
    WHERE ae.email IS NOT NULL
      AND ae.email = lower(nullif(trim(p.email), ''))
  ),
  updated_at = now()
WHERE true;

WITH approved_editors AS (
  SELECT DISTINCT lower(nullif(trim(coalesce(registration_data->>'email', registration_data->>'contact_email')), '')) AS email
  FROM public.professional_registration_requests
  WHERE status = 'approved'
    AND professional_type = 'editor'
)
UPDATE public.publishers p
SET deleted_at = NULL,
    updated_at = now()
WHERE is_validated = true
  AND deleted_at IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM approved_editors ae
    WHERE ae.email IS NOT NULL
      AND ae.email = lower(nullif(trim(p.email), ''))
  );

-- 2) Printers: mark validated iff email appears in approved printers
WITH approved_printers AS (
  SELECT DISTINCT lower(nullif(trim(coalesce(registration_data->>'email', registration_data->>'contact_email')), '')) AS email
  FROM public.professional_registration_requests
  WHERE status = 'approved'
    AND professional_type = 'printer'
)
UPDATE public.printers pr
SET is_validated = EXISTS (
    SELECT 1
    FROM approved_printers ap
    WHERE ap.email IS NOT NULL
      AND ap.email = lower(nullif(trim(pr.email), ''))
  ),
  updated_at = now()
WHERE true;

WITH approved_printers AS (
  SELECT DISTINCT lower(nullif(trim(coalesce(registration_data->>'email', registration_data->>'contact_email')), '')) AS email
  FROM public.professional_registration_requests
  WHERE status = 'approved'
    AND professional_type = 'printer'
)
UPDATE public.printers pr
SET deleted_at = NULL,
    updated_at = now()
WHERE is_validated = true
  AND deleted_at IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM approved_printers ap
    WHERE ap.email IS NOT NULL
      AND ap.email = lower(nullif(trim(pr.email), ''))
  );
