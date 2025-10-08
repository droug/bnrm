-- Créer une table pour gérer les parties impliquées dans une demande de dépôt légal
CREATE TABLE IF NOT EXISTS public.legal_deposit_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.legal_deposit_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  party_role TEXT NOT NULL, -- 'editor', 'printer', 'producer'
  is_initiator BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approval_date TIMESTAMP WITH TIME ZONE,
  approval_comments TEXT,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(request_id, user_id, party_role)
);

-- Ajouter des index
CREATE INDEX IF NOT EXISTS idx_legal_deposit_parties_request ON public.legal_deposit_parties(request_id);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_parties_user ON public.legal_deposit_parties(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_parties_status ON public.legal_deposit_parties(approval_status);

-- Activer RLS
ALTER TABLE public.legal_deposit_parties ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view parties where they are involved"
ON public.legal_deposit_parties
FOR SELECT
USING (
  auth.uid() = user_id OR 
  is_admin_or_librarian(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.legal_deposit_parties ldp2
    WHERE ldp2.request_id = legal_deposit_parties.request_id
    AND ldp2.user_id = auth.uid()
  )
);

CREATE POLICY "Initiators can add parties to their requests"
ON public.legal_deposit_parties
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.legal_deposit_requests ldr
    WHERE ldr.id = request_id
    AND ldr.initiator_id = auth.uid()
  ) OR is_admin_or_librarian(auth.uid())
);

CREATE POLICY "Parties can update their own approval status"
ON public.legal_deposit_parties
FOR UPDATE
USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage all parties"
ON public.legal_deposit_parties
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_legal_deposit_parties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_legal_deposit_parties_updated_at
BEFORE UPDATE ON public.legal_deposit_parties
FOR EACH ROW
EXECUTE FUNCTION update_legal_deposit_parties_updated_at();

-- Fonction pour vérifier si toutes les parties ont approuvé
CREATE OR REPLACE FUNCTION check_all_parties_approved(p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_parties INTEGER;
  approved_parties INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_parties
  FROM legal_deposit_parties
  WHERE request_id = p_request_id;
  
  SELECT COUNT(*) INTO approved_parties
  FROM legal_deposit_parties
  WHERE request_id = p_request_id
  AND approval_status = 'approved';
  
  -- Si aucune partie (ancien système), retourner true
  IF total_parties = 0 THEN
    RETURN true;
  END IF;
  
  RETURN approved_parties = total_parties;
END;
$$;

-- Fonction pour obtenir le rôle professionnel d'un utilisateur
CREATE OR REPLACE FUNCTION get_professional_role(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM user_roles
  WHERE user_id = p_user_id
  AND role::text IN ('editor', 'printer', 'producer')
  LIMIT 1;
$$;