-- Allow requester_id to be nullable for cases where ranges are assigned to external professionals
ALTER TABLE public.reserved_number_ranges 
ALTER COLUMN requester_id DROP NOT NULL;