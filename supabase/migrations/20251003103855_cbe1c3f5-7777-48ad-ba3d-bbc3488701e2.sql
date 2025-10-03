-- Create virtual_exhibitions table
CREATE TABLE IF NOT EXISTS public.virtual_exhibitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  visitor_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create exhibition_resources junction table
CREATE TABLE IF NOT EXISTS public.exhibition_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES public.virtual_exhibitions(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(exhibition_id, content_id)
);

-- Create exhibition_visits table for tracking
CREATE TABLE IF NOT EXISTS public.exhibition_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id UUID REFERENCES public.virtual_exhibitions(id) ON DELETE CASCADE,
  user_id UUID,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.virtual_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibition_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exhibition_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_exhibitions
CREATE POLICY "Everyone can view active exhibitions"
  ON public.virtual_exhibitions
  FOR SELECT
  USING (is_active = true AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can manage exhibitions"
  ON public.virtual_exhibitions
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for exhibition_resources
CREATE POLICY "Everyone can view exhibition resources"
  ON public.exhibition_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.virtual_exhibitions ve
      WHERE ve.id = exhibition_resources.exhibition_id
      AND ve.is_active = true
      AND ve.start_date <= now()
      AND ve.end_date >= now()
    )
  );

CREATE POLICY "Admins can manage exhibition resources"
  ON public.exhibition_resources
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for exhibition_visits
CREATE POLICY "Users can log their visits"
  ON public.exhibition_visits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view visits"
  ON public.exhibition_visits
  FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

-- Create trigger to update updated_at
CREATE TRIGGER update_virtual_exhibitions_updated_at
  BEFORE UPDATE ON public.virtual_exhibitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment visitor count
CREATE OR REPLACE FUNCTION public.increment_exhibition_visitors(exhibition_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.virtual_exhibitions
  SET visitor_count = visitor_count + 1
  WHERE id = exhibition_uuid;
END;
$$;

-- Create index for performance
CREATE INDEX idx_exhibitions_dates ON public.virtual_exhibitions(start_date, end_date);
CREATE INDEX idx_exhibition_visits_exhibition ON public.exhibition_visits(exhibition_id);
CREATE INDEX idx_exhibition_resources_exhibition ON public.exhibition_resources(exhibition_id);