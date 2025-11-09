-- Create table for CBM adhesions (membership requests)
CREATE TABLE IF NOT EXISTS public.cbm_adhesions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  library_name TEXT NOT NULL,
  library_type TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  motivation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- Create table for CBM formation requests
CREATE TABLE IF NOT EXISTS public.cbm_formation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  library_name TEXT NOT NULL,
  training_type TEXT NOT NULL,
  preferred_dates TEXT,
  number_of_participants INTEGER,
  specific_needs TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT
);

-- Enable Row Level Security
ALTER TABLE public.cbm_adhesions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbm_formation_requests ENABLE ROW LEVEL SECURITY;

-- Policies for cbm_adhesions
CREATE POLICY "Users can view their own adhesion requests" 
ON public.cbm_adhesions 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users));

CREATE POLICY "Users can create their own adhesion requests" 
ON public.cbm_adhesions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update adhesion requests" 
ON public.cbm_adhesions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Policies for cbm_formation_requests
CREATE POLICY "Users can view their own formation requests" 
ON public.cbm_formation_requests 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users));

CREATE POLICY "Users can create their own formation requests" 
ON public.cbm_formation_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update formation requests" 
ON public.cbm_formation_requests 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_cbm_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cbm_adhesions_updated_at
BEFORE UPDATE ON public.cbm_adhesions
FOR EACH ROW
EXECUTE FUNCTION public.update_cbm_updated_at();

CREATE TRIGGER update_cbm_formation_requests_updated_at
BEFORE UPDATE ON public.cbm_formation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_cbm_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cbm_adhesions_status ON public.cbm_adhesions(status);
CREATE INDEX IF NOT EXISTS idx_cbm_adhesions_created_at ON public.cbm_adhesions(created_at);
CREATE INDEX IF NOT EXISTS idx_cbm_formation_requests_status ON public.cbm_formation_requests(status);
CREATE INDEX IF NOT EXISTS idx_cbm_formation_requests_created_at ON public.cbm_formation_requests(created_at);