-- Create table for reserved number ranges per requester
CREATE TABLE IF NOT EXISTS public.reserved_number_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  deposit_type TEXT NOT NULL, -- 'monograph', 'periodical', etc.
  number_type TEXT NOT NULL CHECK (number_type IN ('isbn', 'issn', 'dl')),
  range_start TEXT NOT NULL,
  range_end TEXT NOT NULL,
  current_position TEXT NOT NULL,
  total_numbers INTEGER NOT NULL,
  used_numbers INTEGER DEFAULT 0,
  reserved_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reserved_number_ranges ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage reserved ranges"
ON public.reserved_number_ranges
FOR ALL
TO authenticated
USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can view their own reserved ranges"
ON public.reserved_number_ranges
FOR SELECT
TO authenticated
USING (requester_id = auth.uid() OR public.is_admin_or_librarian(auth.uid()));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_reserved_ranges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reserved_ranges_updated_at
BEFORE UPDATE ON public.reserved_number_ranges
FOR EACH ROW
EXECUTE FUNCTION public.update_reserved_ranges_updated_at();

-- Add index for performance
CREATE INDEX idx_reserved_ranges_requester ON public.reserved_number_ranges(requester_id);
CREATE INDEX idx_reserved_ranges_type ON public.reserved_number_ranges(deposit_type, number_type);
CREATE INDEX idx_reserved_ranges_status ON public.reserved_number_ranges(status);