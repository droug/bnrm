-- Table pour les propositions de programmation culturelle
CREATE TABLE public.cultural_program_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_number TEXT NOT NULL UNIQUE,
  requester_id UUID NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  proposed_date DATE NOT NULL,
  proposed_time TEXT,
  duration_hours INTEGER,
  expected_attendees INTEGER,
  space_requirements TEXT,
  equipment_needs TEXT,
  budget_estimate NUMERIC,
  status TEXT NOT NULL DEFAULT 'en_attente',
  committee_comments TEXT,
  committee_signature TEXT,
  signed_by UUID,
  signed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  validation_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_cultural_proposals_status ON public.cultural_program_proposals(status);
CREATE INDEX idx_cultural_proposals_requester ON public.cultural_program_proposals(requester_id);
CREATE INDEX idx_cultural_proposals_date ON public.cultural_program_proposals(proposed_date);
CREATE INDEX idx_cultural_proposals_type ON public.cultural_program_proposals(activity_type);

-- RLS policies
ALTER TABLE public.cultural_program_proposals ENABLE ROW LEVEL SECURITY;

-- Les admins peuvent tout faire
CREATE POLICY "Admins peuvent gérer les propositions"
  ON public.cultural_program_proposals
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Les utilisateurs peuvent créer leurs propositions
CREATE POLICY "Utilisateurs peuvent créer des propositions"
  ON public.cultural_program_proposals
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Les utilisateurs peuvent voir leurs propres propositions
CREATE POLICY "Utilisateurs peuvent voir leurs propositions"
  ON public.cultural_program_proposals
  FOR SELECT
  USING (auth.uid() = requester_id OR is_admin_or_librarian(auth.uid()));

-- Fonction pour générer le numéro de proposition
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(proposal_number FROM '^(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM cultural_program_proposals
  WHERE proposal_number ~ '^\d+/PC/'
  AND SUBSTRING(proposal_number FROM '/(\d{2})$') = year_suffix;
  
  RETURN next_number::TEXT || '/PC/' || year_suffix;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le numéro
CREATE OR REPLACE FUNCTION set_proposal_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
    NEW.proposal_number := generate_proposal_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_proposal_number
  BEFORE INSERT ON public.cultural_program_proposals
  FOR EACH ROW
  EXECUTE FUNCTION set_proposal_number();

-- Trigger pour updated_at
CREATE TRIGGER update_cultural_proposals_updated_at
  BEFORE UPDATE ON public.cultural_program_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();