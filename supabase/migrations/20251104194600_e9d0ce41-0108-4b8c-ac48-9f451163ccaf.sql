-- Table pour les données du formulaire de dépôt légal - Monographies
CREATE TABLE IF NOT EXISTS public.legal_deposit_monograph_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.legal_deposit_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Section: Identification de l'auteur
  nom_auteur TEXT,
  prenom_auteur TEXT,
  nationalite_auteur TEXT,
  cin_auteur TEXT,
  
  -- Section: Identification de la publication
  titre_publication TEXT NOT NULL,
  sous_titre TEXT,
  isbn TEXT,
  nombre_pages INTEGER,
  format TEXT,
  langue_publication TEXT,
  date_publication DATE,
  
  -- Section: Identification de l'éditeur
  nom_editeur TEXT,
  adresse_editeur TEXT,
  ville_editeur TEXT,
  telephone_editeur TEXT,
  email_editeur TEXT,
  
  -- Section: Identification de l'imprimeur
  nom_imprimeur TEXT,
  adresse_imprimeur TEXT,
  ville_imprimeur TEXT,
  tirage INTEGER,
  
  -- Section: Pièces à fournir
  exemplaires_depot INTEGER,
  cin_copie_url TEXT,
  bordereau_depot_url TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT legal_deposit_monograph_data_request_unique UNIQUE(request_id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_legal_deposit_monograph_user ON public.legal_deposit_monograph_data(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_monograph_request ON public.legal_deposit_monograph_data(request_id);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_monograph_titre ON public.legal_deposit_monograph_data(titre_publication);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_monograph_isbn ON public.legal_deposit_monograph_data(isbn);
CREATE INDEX IF NOT EXISTS idx_legal_deposit_monograph_auteur ON public.legal_deposit_monograph_data(nom_auteur, prenom_auteur);

-- Enable RLS
ALTER TABLE public.legal_deposit_monograph_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own monograph data"
  ON public.legal_deposit_monograph_data
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can insert their own monograph data"
  ON public.legal_deposit_monograph_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monograph data"
  ON public.legal_deposit_monograph_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all monograph data"
  ON public.legal_deposit_monograph_data
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_legal_deposit_monograph_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_legal_deposit_monograph_data_updated_at_trigger
  BEFORE UPDATE ON public.legal_deposit_monograph_data
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_deposit_monograph_data_updated_at();

-- Commentaires sur la table
COMMENT ON TABLE public.legal_deposit_monograph_data IS 'Données spécifiques au formulaire de dépôt légal des monographies';
COMMENT ON COLUMN public.legal_deposit_monograph_data.request_id IS 'Référence vers la demande de dépôt légal principale';
COMMENT ON COLUMN public.legal_deposit_monograph_data.titre_publication IS 'Titre de la monographie (requis)';
COMMENT ON COLUMN public.legal_deposit_monograph_data.exemplaires_depot IS 'Nombre d''exemplaires déposés (minimum 3)';