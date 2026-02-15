-- Extend status check constraint to include 'deleted'
ALTER TABLE public.professional_registration_requests 
DROP CONSTRAINT professional_registration_requests_status_check;

ALTER TABLE public.professional_registration_requests 
ADD CONSTRAINT professional_registration_requests_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'deleted'::text]));

-- Fix existing deleted professional's registration request status
UPDATE public.professional_registration_requests 
SET status = 'deleted', updated_at = now() 
WHERE user_id = 'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0' 
AND status = 'approved';