-- Create partnerships table
CREATE TABLE IF NOT EXISTS public.partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identification organisme
  nom_organisme TEXT NOT NULL,
  statut_juridique TEXT NOT NULL CHECK (statut_juridique IN ('association', 'organisme_public', 'organisme_prive', 'autre')),
  nationalite TEXT NOT NULL CHECK (nationalite IN ('marocain', 'etranger')),
  type_organisation TEXT NOT NULL CHECK (type_organisation IN ('institution', 'etablissement', 'ong', 'entreprise', 'collectivite')),
  description_organisme TEXT,
  telephone TEXT NOT NULL,
  email_officiel TEXT NOT NULL,
  adresse TEXT NOT NULL,
  site_web TEXT,
  statut_document_url TEXT,
  
  -- Représentants (JSONB array)
  representants JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Détails partenariat
  objet_partenariat TEXT NOT NULL,
  description_projet TEXT NOT NULL,
  type_partenariat TEXT NOT NULL CHECK (type_partenariat IN ('culturel', 'educatif', 'evenementiel', 'scientifique', 'autre')),
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  lieu_concerne TEXT,
  programme_url TEXT NOT NULL,
  objectifs TEXT NOT NULL,
  public_cible TEXT NOT NULL,
  moyens_organisme TEXT NOT NULL,
  moyens_bnrm TEXT NOT NULL,
  
  -- Workflow
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_examen', 'accepte', 'refuse', 'clarification_demandee')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes_admin TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for email lookup (prevent duplicate active requests)
CREATE INDEX idx_partnerships_email_statut ON public.partnerships(email_officiel, statut);

-- Create index for status
CREATE INDEX idx_partnerships_statut ON public.partnerships(statut);

-- Enable RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public submission)
CREATE POLICY "Anyone can submit partnership request"
ON public.partnerships
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own partnership requests"
ON public.partnerships
FOR SELECT
TO public
USING (email_officiel = current_setting('request.headers')::json->>'x-user-email' OR auth.uid() IS NOT NULL);

-- Policy: Admins can view all
CREATE POLICY "Admins can view all partnership requests"
ON public.partnerships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

-- Policy: Admins can update
CREATE POLICY "Admins can update partnership requests"
ON public.partnerships
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_partnerships_updated_at
BEFORE UPDATE ON public.partnerships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for partnership documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('partnership-documents', 'partnership-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload partnership documents"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'partnership-documents');

CREATE POLICY "Anyone can view partnership documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'partnership-documents');