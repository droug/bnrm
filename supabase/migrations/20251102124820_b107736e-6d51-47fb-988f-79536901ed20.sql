-- Création de la table pour les demandes de restauration de manuscrits
CREATE TABLE IF NOT EXISTS public.restoration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  manuscript_title TEXT NOT NULL,
  manuscript_cote TEXT NOT NULL,
  damage_description TEXT NOT NULL,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('faible', 'moyenne', 'elevee', 'critique')),
  status TEXT NOT NULL DEFAULT 'soumise' CHECK (status IN ('soumise', 'en_evaluation', 'validee', 'refusee', 'en_cours', 'terminee', 'annulee')),
  user_notes TEXT,
  rejection_reason TEXT,
  validation_notes TEXT,
  estimated_cost NUMERIC,
  estimated_duration INTEGER,
  assigned_restorer TEXT,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restoration_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for restoration requests
CREATE POLICY "Users can view their own restoration requests" 
ON public.restoration_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create restoration requests" 
ON public.restoration_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending requests" 
ON public.restoration_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'soumise');

CREATE POLICY "Admins and librarians can view all restoration requests" 
ON public.restoration_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

CREATE POLICY "Admins and librarians can update restoration requests" 
ON public.restoration_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

-- Create index for better performance
CREATE INDEX idx_restoration_requests_user_id ON public.restoration_requests(user_id);
CREATE INDEX idx_restoration_requests_status ON public.restoration_requests(status);
CREATE INDEX idx_restoration_requests_submitted_at ON public.restoration_requests(submitted_at DESC);
CREATE INDEX idx_restoration_requests_urgency ON public.restoration_requests(urgency_level);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_restoration_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_restoration_requests_timestamp
BEFORE UPDATE ON public.restoration_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_restoration_requests_updated_at();

-- Function to generate unique request numbers
CREATE OR REPLACE FUNCTION public.generate_restoration_request_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  counter := (SELECT COUNT(*) FROM public.restoration_requests) + 1;
  new_number := 'REST-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
  
  WHILE EXISTS (SELECT 1 FROM public.restoration_requests WHERE request_number = new_number) LOOP
    counter := counter + 1;
    new_number := 'REST-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(counter::TEXT, 6, '0');
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate request number
CREATE OR REPLACE FUNCTION public.set_restoration_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := public.generate_restoration_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_restoration_request_number_trigger
BEFORE INSERT ON public.restoration_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_restoration_request_number();