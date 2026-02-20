
-- Remettre en 'pending' toutes les demandes gratuites auto-activées
-- (sans intervention admin : processed_by IS NULL et is_paid = true artificiellement)
UPDATE public.service_registrations
SET 
  status = 'pending',
  is_paid = false,
  processed_by = NULL,
  processed_at = NULL,
  updated_at = NOW()
WHERE id IN (
  SELECT sr.id
  FROM public.service_registrations sr
  JOIN public.bnrm_services bs ON sr.service_id = bs.id_service
  WHERE bs.is_free = true
    AND sr.status = 'active'
    AND sr.processed_by IS NULL
);
