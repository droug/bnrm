-- Create printers table for printer/printing house information
CREATE TABLE IF NOT EXISTS public.printers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'Maroc',
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view printers"
ON public.printers
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create printers"
ON public.printers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage printers"
ON public.printers
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Insert some example printers
INSERT INTO public.printers (name, city, country) VALUES
  ('Imprimerie Najah El Jadida', 'Casablanca', 'Maroc'),
  ('Imprimerie El Maârif El Jadida', 'Rabat', 'Maroc'),
  ('Imprimerie Dar El Kitab', 'Casablanca', 'Maroc'),
  ('Imprimerie Bouregreg', 'Salé', 'Maroc'),
  ('Imprimerie Papeterie Warzazi', 'Rabat', 'Maroc'),
  ('Imprimerie Al Andalous', 'Casablanca', 'Maroc'),
  ('Imprimerie Fedala', 'Mohammedia', 'Maroc'),
  ('Imprimerie El Mouttahida', 'Rabat', 'Maroc')
ON CONFLICT DO NOTHING;