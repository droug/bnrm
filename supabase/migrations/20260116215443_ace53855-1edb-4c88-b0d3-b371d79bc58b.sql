-- Add requester_email column to issn_requests for notifications
ALTER TABLE public.issn_requests 
ADD COLUMN IF NOT EXISTS requester_email TEXT;