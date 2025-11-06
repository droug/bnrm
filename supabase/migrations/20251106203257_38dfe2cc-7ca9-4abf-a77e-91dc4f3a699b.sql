-- Create table for training requests
CREATE TABLE public.cbm_demandes_formation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom_organisme TEXT NOT NULL,
  type_organisme TEXT NOT NULL,
  nom_contact TEXT NOT NULL,
  fonction_contact TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  type_formation TEXT NOT NULL,
  nombre_participants INTEGER NOT NULL,
  besoins_specifiques TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cbm_demandes_formation ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit a training request
CREATE POLICY "Anyone can insert training requests"
ON public.cbm_demandes_formation
FOR INSERT
WITH CHECK (true);

-- Policy: Admins and librarians can view all training requests
CREATE POLICY "Admins and librarians can view training requests"
ON public.cbm_demandes_formation
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Policy: Admins and librarians can update training requests
CREATE POLICY "Admins and librarians can update training requests"
ON public.cbm_demandes_formation
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cbm_demandes_formation_updated_at
BEFORE UPDATE ON public.cbm_demandes_formation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
