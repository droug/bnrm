-- Add columns to reserved_number_ranges for better declarant tracking
ALTER TABLE public.reserved_number_ranges 
ADD COLUMN IF NOT EXISTS requester_name TEXT,
ADD COLUMN IF NOT EXISTS requester_email TEXT,
ADD COLUMN IF NOT EXISTS used_numbers_list TEXT[] DEFAULT '{}';