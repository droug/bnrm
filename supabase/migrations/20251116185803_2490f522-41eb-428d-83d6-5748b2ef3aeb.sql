-- Add rejection_reason column to service_registrations table
ALTER TABLE public.service_registrations 
ADD COLUMN rejection_reason TEXT;