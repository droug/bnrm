-- Update status check constraint to include rejected and expired
ALTER TABLE public.service_registrations 
DROP CONSTRAINT IF EXISTS service_registrations_status_check;

ALTER TABLE public.service_registrations 
ADD CONSTRAINT service_registrations_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'cancelled'::text, 'rejected'::text, 'expired'::text]));