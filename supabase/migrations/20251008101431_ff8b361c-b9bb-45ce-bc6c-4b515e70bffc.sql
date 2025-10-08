-- Table pour le comité de validation du dépôt légal
CREATE TABLE IF NOT EXISTS public.legal_deposit_validation_committee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'member', 'secretary')),
  specialization TEXT,
  is_active BOOLEAN DEFAULT true,
  appointed_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  appointed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les décisions du comité
CREATE TABLE IF NOT EXISTS public.legal_deposit_committee_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.legal_deposit_requests(id) ON DELETE CASCADE,
  committee_member_id UUID NOT NULL REFERENCES public.legal_deposit_validation_committee(id),
  review_status TEXT NOT NULL CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
  review_date TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  decision_rationale TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, committee_member_id)
);

-- Ajouter un nouveau statut pour la validation du comité
ALTER TYPE deposit_status ADD VALUE IF NOT EXISTS 'en_attente_comite_validation';
ALTER TYPE deposit_status ADD VALUE IF NOT EXISTS 'valide_par_comite';
ALTER TYPE deposit_status ADD VALUE IF NOT EXISTS 'rejete_par_comite';

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_committee_member_active ON public.legal_deposit_validation_committee(member_id, is_active);
CREATE INDEX IF NOT EXISTS idx_committee_reviews_request ON public.legal_deposit_committee_reviews(request_id, review_status);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_legal_deposit_committee_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_committee_updated_at
  BEFORE UPDATE ON public.legal_deposit_validation_committee
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_deposit_committee_updated_at();

CREATE TRIGGER update_committee_reviews_updated_at
  BEFORE UPDATE ON public.legal_deposit_committee_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_deposit_committee_updated_at();

-- RLS Policies
ALTER TABLE public.legal_deposit_validation_committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_deposit_committee_reviews ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer le comité
CREATE POLICY "Admins can manage committee members"
  ON public.legal_deposit_validation_committee
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Les membres du comité peuvent voir leurs collègues
CREATE POLICY "Committee members can view committee"
  ON public.legal_deposit_validation_committee
  FOR SELECT
  USING (
    is_admin_or_librarian(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.legal_deposit_validation_committee
      WHERE member_id = auth.uid() AND is_active = true
    )
  );

-- Les admins et membres du comité peuvent gérer les reviews
CREATE POLICY "Admins can manage committee reviews"
  ON public.legal_deposit_committee_reviews
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Les membres du comité peuvent créer et modifier leurs propres reviews
CREATE POLICY "Committee members can manage their reviews"
  ON public.legal_deposit_committee_reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.legal_deposit_validation_committee c
      WHERE c.id = committee_member_id 
      AND c.member_id = auth.uid() 
      AND c.is_active = true
    )
  );

-- Fonction pour vérifier si une demande est approuvée par le comité
CREATE OR REPLACE FUNCTION check_committee_approval(request_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_members INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
BEGIN
  -- Compter le nombre de membres actifs du comité
  SELECT COUNT(*) INTO total_members
  FROM legal_deposit_validation_committee
  WHERE is_active = true;
  
  -- Compter les approbations et rejets
  SELECT 
    COUNT(*) FILTER (WHERE review_status = 'approved'),
    COUNT(*) FILTER (WHERE review_status = 'rejected')
  INTO approved_count, rejected_count
  FROM legal_deposit_committee_reviews
  WHERE request_id = request_uuid;
  
  -- Si au moins un membre rejette, la demande est rejetée
  IF rejected_count > 0 THEN
    RETURN false;
  END IF;
  
  -- Si tous les membres ont approuvé (ou au moins la majorité selon la règle)
  IF approved_count >= CEIL(total_members::NUMERIC * 0.5) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

COMMENT ON TABLE public.legal_deposit_validation_committee IS 'Comité de validation pour les demandes de dépôt légal';
COMMENT ON TABLE public.legal_deposit_committee_reviews IS 'Évaluations des demandes par les membres du comité de validation';
COMMENT ON FUNCTION check_committee_approval IS 'Vérifie si une demande a été approuvée par le comité (majorité requise)';
