-- Table pour stocker les invitations professionnelles
CREATE TABLE IF NOT EXISTS public.professional_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('editor', 'printer', 'producer', 'distributor')),
  last_deposit_number TEXT NOT NULL, -- Dernier numéro DL/ISSN pour vérification
  invitation_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les documents uploadés lors de l'inscription
CREATE TABLE IF NOT EXISTS public.professional_registration_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES public.professional_invitations(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('identity_card', 'professional_certificate', 'business_license', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_kb INTEGER,
  mime_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les demandes de création de compte en attente de validation
CREATE TABLE IF NOT EXISTS public.professional_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.professional_invitations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type TEXT NOT NULL,
  verified_deposit_number TEXT NOT NULL,
  company_name TEXT,
  registration_data JSONB DEFAULT '{}',
  cndp_acceptance BOOLEAN DEFAULT FALSE,
  cndp_accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.professional_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_registration_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_registration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour professional_invitations
CREATE POLICY "Admins can manage invitations"
ON public.professional_invitations
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can view their own invitation"
ON public.professional_invitations
FOR SELECT
TO authenticated
USING (
  email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- RLS Policies pour professional_registration_documents
CREATE POLICY "Admins can view all documents"
ON public.professional_registration_documents
FOR SELECT
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can upload their own documents"
ON public.professional_registration_documents
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own documents"
ON public.professional_registration_documents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies pour professional_registration_requests
CREATE POLICY "Admins can manage registration requests"
ON public.professional_registration_requests
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can create their registration request"
ON public.professional_registration_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own request"
ON public.professional_registration_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Fonction pour vérifier le numéro de dépôt
CREATE OR REPLACE FUNCTION public.verify_professional_deposit_number(
  p_email TEXT,
  p_deposit_number TEXT,
  p_professional_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation professional_invitations%ROWTYPE;
  v_deposit_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Vérifier si l'invitation existe et est valide
  SELECT * INTO v_invitation
  FROM professional_invitations
  WHERE email = p_email
    AND professional_type = p_professional_type
    AND status = 'pending'
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invitation non trouvée ou expirée'
    );
  END IF;
  
  -- Vérifier si le numéro de dépôt correspond
  IF v_invitation.last_deposit_number != p_deposit_number THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Numéro de dépôt incorrect'
    );
  END IF;
  
  -- Vérifier que le numéro de dépôt existe dans la base
  SELECT EXISTS (
    SELECT 1 FROM legal_deposit_requests
    WHERE request_number = p_deposit_number
  ) INTO v_deposit_exists;
  
  IF NOT v_deposit_exists THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Numéro de dépôt non trouvé dans la base'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'invitation_id', v_invitation.id,
    'invitation_token', v_invitation.invitation_token
  );
END;
$$;

-- Fonction pour approuver une demande d'inscription
CREATE OR REPLACE FUNCTION public.approve_professional_registration(
  p_request_id UUID,
  p_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request professional_registration_requests%ROWTYPE;
  v_user_role user_role;
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT is_admin_or_librarian(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé: seuls les administrateurs peuvent approuver les demandes';
  END IF;
  
  -- Récupérer la demande
  SELECT * INTO v_request
  FROM professional_registration_requests
  WHERE id = p_request_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Demande non trouvée';
  END IF;
  
  -- Convertir le type professionnel en rôle
  CASE p_role
    WHEN 'editor' THEN v_user_role := 'editor'::user_role;
    WHEN 'printer' THEN v_user_role := 'printer'::user_role;
    WHEN 'producer' THEN v_user_role := 'producer'::user_role;
    WHEN 'distributor' THEN v_user_role := 'distributor'::user_role;
    ELSE RAISE EXCEPTION 'Type professionnel invalide';
  END CASE;
  
  -- Mettre à jour la demande
  UPDATE professional_registration_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Approuver le profil utilisateur
  UPDATE profiles
  SET 
    is_approved = true,
    updated_at = NOW()
  WHERE user_id = v_request.user_id;
  
  -- Attribuer le rôle
  INSERT INTO user_roles (user_id, role, granted_by, granted_at)
  VALUES (v_request.user_id, v_user_role, auth.uid(), NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Marquer l'invitation comme utilisée
  UPDATE professional_invitations
  SET status = 'used', updated_at = NOW()
  WHERE id = v_request.invitation_id;
  
  RETURN true;
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_professional_invitations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_professional_invitations_updated_at
BEFORE UPDATE ON professional_invitations
FOR EACH ROW
EXECUTE FUNCTION update_professional_invitations_updated_at();

CREATE TRIGGER update_professional_registration_requests_updated_at
BEFORE UPDATE ON professional_registration_requests
FOR EACH ROW
EXECUTE FUNCTION update_professional_invitations_updated_at();

-- Index pour les recherches
CREATE INDEX idx_professional_invitations_email ON professional_invitations(email);
CREATE INDEX idx_professional_invitations_token ON professional_invitations(invitation_token);
CREATE INDEX idx_professional_invitations_status ON professional_invitations(status);
CREATE INDEX idx_professional_registration_requests_status ON professional_registration_requests(status);
CREATE INDEX idx_professional_registration_documents_user ON professional_registration_documents(user_id);
CREATE INDEX idx_professional_registration_documents_status ON professional_registration_documents(verification_status);