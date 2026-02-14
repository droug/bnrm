ALTER TABLE public.service_registrations DROP CONSTRAINT service_registrations_status_check;

ALTER TABLE public.service_registrations ADD CONSTRAINT service_registrations_status_check 
CHECK (status = ANY (ARRAY['pending', 'payment_sent', 'paid', 'active', 'suspended', 'cancelled', 'rejected', 'expired']));