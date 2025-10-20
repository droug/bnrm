-- Table pour les demandes de numérisation
CREATE TABLE IF NOT EXISTS public.digitization_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID,
  document_title TEXT NOT NULL,
  document_cote TEXT,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  pages_count INTEGER NOT NULL CHECK (pages_count > 0 AND pages_count <= 1000),
  justification TEXT NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('research', 'study', 'publication', 'other')),
  attachment_url TEXT,
  copyright_agreement BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'en_cours', 'approuve', 'rejete', 'termine')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_digitization_requests_user_id ON public.digitization_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_digitization_requests_status ON public.digitization_requests(status);
CREATE INDEX IF NOT EXISTS idx_digitization_requests_created_at ON public.digitization_requests(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_digitization_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER digitization_requests_updated_at
  BEFORE UPDATE ON public.digitization_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_digitization_requests_updated_at();

-- RLS Policies
ALTER TABLE public.digitization_requests ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Users can view their own digitization requests"
  ON public.digitization_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create their own digitization requests"
  ON public.digitization_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND copyright_agreement = true);

-- Les utilisateurs peuvent mettre à jour leurs propres demandes (seulement si en_attente)
CREATE POLICY "Users can update their own pending digitization requests"
  ON public.digitization_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'en_attente')
  WITH CHECK (auth.uid() = user_id AND status = 'en_attente');

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all digitization requests"
  ON public.digitization_requests
  FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all digitization requests"
  ON public.digitization_requests
  FOR UPDATE
  USING (is_admin_or_librarian(auth.uid()));

-- Commentaires
COMMENT ON TABLE public.digitization_requests IS 'Demandes de numérisation de documents par les utilisateurs';
COMMENT ON COLUMN public.digitization_requests.pages_count IS 'Nombre de pages à numériser (max 1000)';
COMMENT ON COLUMN public.digitization_requests.usage_type IS 'Type d''utilisation: research, study, publication, other';
COMMENT ON COLUMN public.digitization_requests.copyright_agreement IS 'Confirmation du respect des droits d''auteur';
COMMENT ON COLUMN public.digitization_requests.status IS 'Statut: en_attente, en_cours, approuve, rejete, termine';