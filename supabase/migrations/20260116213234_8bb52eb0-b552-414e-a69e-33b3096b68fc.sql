-- Create ISSN requests table
CREATE TABLE IF NOT EXISTS public.issn_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  title TEXT NOT NULL,
  discipline TEXT NOT NULL,
  language_code TEXT NOT NULL,
  country_code TEXT NOT NULL,
  publisher TEXT NOT NULL,
  support TEXT NOT NULL,
  frequency TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  justification_file_url TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente',
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequence for human-friendly request numbers
CREATE SEQUENCE IF NOT EXISTS public.issn_request_seq;

-- Assign request_number on insert
CREATE OR REPLACE FUNCTION public.set_issn_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := 'ISSN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.issn_request_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS set_issn_request_number_before_insert ON public.issn_requests;
CREATE TRIGGER set_issn_request_number_before_insert
BEFORE INSERT ON public.issn_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_issn_request_number();

-- updated_at trigger (uses existing helper)
DROP TRIGGER IF EXISTS update_issn_requests_updated_at ON public.issn_requests;
CREATE TRIGGER update_issn_requests_updated_at
BEFORE UPDATE ON public.issn_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_issn_requests_status ON public.issn_requests(status);
CREATE INDEX IF NOT EXISTS idx_issn_requests_created_at ON public.issn_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issn_requests_user_id ON public.issn_requests(user_id);

-- RLS
ALTER TABLE public.issn_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- INSERT: user creates own request
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'issn_requests' AND policyname = 'Users can create their ISSN requests'
  ) THEN
    CREATE POLICY "Users can create their ISSN requests"
    ON public.issn_requests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- SELECT: user can view own
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'issn_requests' AND policyname = 'Users can view own ISSN requests'
  ) THEN
    CREATE POLICY "Users can view own ISSN requests"
    ON public.issn_requests
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  -- SELECT: admins/librarians can view all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'issn_requests' AND policyname = 'Admins can view all ISSN requests'
  ) THEN
    CREATE POLICY "Admins can view all ISSN requests"
    ON public.issn_requests
    FOR SELECT
    USING (public.is_admin_or_librarian(auth.uid()));
  END IF;

  -- UPDATE: admins/librarians can update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'issn_requests' AND policyname = 'Admins can update ISSN requests'
  ) THEN
    CREATE POLICY "Admins can update ISSN requests"
    ON public.issn_requests
    FOR UPDATE
    USING (public.is_admin_or_librarian(auth.uid()))
    WITH CHECK (public.is_admin_or_librarian(auth.uid()));
  END IF;

  -- DELETE: admins/librarians can delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'issn_requests' AND policyname = 'Admins can delete ISSN requests'
  ) THEN
    CREATE POLICY "Admins can delete ISSN requests"
    ON public.issn_requests
    FOR DELETE
    USING (public.is_admin_or_librarian(auth.uid()));
  END IF;
END $$;