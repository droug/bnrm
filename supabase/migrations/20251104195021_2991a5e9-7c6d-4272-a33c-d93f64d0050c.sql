-- Supprimer l'ancienne table avec mauvais champs
DROP TABLE IF EXISTS public.legal_deposit_monograph_data CASCADE;

-- Recréer la table avec les vrais champs du formulaire
CREATE TABLE public.legal_deposit_monograph_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.legal_deposit_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Section 1: Identification de l'auteur
  author_type TEXT, -- physique/morale
  author_name TEXT,
  author_pseudonym TEXT,
  author_sigle TEXT, -- si morale
  author_status TEXT, -- étatique/non-étatique (si morale)
  author_gender TEXT, -- homme/femme (si physique)
  author_birth_date DATE, -- si physique
  declaration_nature TEXT, -- dépôt initial, nouvelle édition, etc. (si physique)
  author_phone TEXT,
  author_email TEXT,
  author_region TEXT,
  author_city TEXT,
  
  -- Section 2: Identification de la publication
  publication_discipline TEXT, -- hiérarchique
  publication_title TEXT NOT NULL,
  support_type TEXT, -- printed/electronic
  publication_type TEXT, -- code type
  is_periodic TEXT, -- yes/no
  issn_submitted BOOLEAN DEFAULT false,
  has_accompanying_material TEXT, -- yes/no
  accompanying_material_type TEXT, -- cd/usb/sd/other
  collection_title TEXT,
  collection_number TEXT,
  languages TEXT[], -- multiple langues
  multiple_volumes TEXT, -- yes/no
  number_of_volumes INTEGER,
  number_of_pages INTEGER,
  
  -- Section 3: Identification de l'Éditeur
  publisher_id UUID REFERENCES public.publishers(id),
  publication_date DATE, -- date prévue de parution
  
  -- Section 4: Identification de l'imprimeur
  printer_id UUID REFERENCES public.printers(id),
  printer_email TEXT,
  printer_country TEXT,
  printer_phone TEXT,
  printer_address TEXT,
  print_run_number INTEGER,
  
  -- Section 5: Pièces à fournir
  cover_file_url TEXT, -- jpg < 1 MB
  summary_file_url TEXT, -- pdf < 2 MB
  abstract_file_url TEXT, -- pdf < 2 MB
  cin_file_url TEXT, -- jpg/pdf
  thesis_recommendation_url TEXT, -- si publication_type=THE
  quran_authorization_url TEXT, -- si publication_type=COR
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT legal_deposit_monograph_data_request_unique UNIQUE(request_id)
);

-- Index
CREATE INDEX idx_legal_deposit_monograph_user ON public.legal_deposit_monograph_data(user_id);
CREATE INDEX idx_legal_deposit_monograph_request ON public.legal_deposit_monograph_data(request_id);
CREATE INDEX idx_legal_deposit_monograph_title ON public.legal_deposit_monograph_data(publication_title);
CREATE INDEX idx_legal_deposit_monograph_author ON public.legal_deposit_monograph_data(author_name);
CREATE INDEX idx_legal_deposit_monograph_publisher ON public.legal_deposit_monograph_data(publisher_id);
CREATE INDEX idx_legal_deposit_monograph_printer ON public.legal_deposit_monograph_data(printer_id);

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
CREATE TRIGGER update_legal_deposit_monograph_data_updated_at_trigger
  BEFORE UPDATE ON public.legal_deposit_monograph_data
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_deposit_monograph_data_updated_at();

-- Commentaires
COMMENT ON TABLE public.legal_deposit_monograph_data IS 'Données du formulaire de dépôt légal des monographies (champs réels du formulaire)';
COMMENT ON COLUMN public.legal_deposit_monograph_data.publication_title IS 'Titre de l''ouvrage (obligatoire)';
COMMENT ON COLUMN public.legal_deposit_monograph_data.languages IS 'Langues de publication (tableau)';
COMMENT ON COLUMN public.legal_deposit_monograph_data.author_type IS 'Type: physique ou morale (collectivité)';
COMMENT ON COLUMN public.legal_deposit_monograph_data.publication_discipline IS 'Discipline hiérarchique (domaine → sous-discipline)';