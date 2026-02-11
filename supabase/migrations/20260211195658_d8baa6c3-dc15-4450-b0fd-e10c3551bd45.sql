
-- Add assigned_issn column to store the attributed ISSN number
ALTER TABLE public.issn_requests ADD COLUMN assigned_issn TEXT DEFAULT NULL;

-- Add assigned_at timestamp
ALTER TABLE public.issn_requests ADD COLUMN assigned_at TIMESTAMPTZ DEFAULT NULL;

-- Add assigned_by to track who attributed the number
ALTER TABLE public.issn_requests ADD COLUMN assigned_by UUID DEFAULT NULL;
