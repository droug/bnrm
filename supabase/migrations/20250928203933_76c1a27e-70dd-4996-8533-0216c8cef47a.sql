-- Migration pour le système de dépôt légal conforme au CPS
-- Création des types énumérés pour le workflow

-- Type de professionnels
CREATE TYPE professional_type AS ENUM (
  'editeur',
  'producteur', 
  'imprimeur'
);

-- Statuts du workflow de dépôt légal
CREATE TYPE deposit_status AS ENUM (
  'brouillon',
  'soumis',
  'en_attente_validation_b',
  'valide_par_b',
  'rejete_par_b',
  'en_cours',
  'attribue',
  'receptionne',
  'rejete'
);

-- Types de supports
CREATE TYPE support_type AS ENUM (
  'imprime',
  'electronique'
);

-- Types de monographies
CREATE TYPE monograph_type AS ENUM (
  'livres',
  'beaux_livres',
  'encyclopedies',
  'corans',
  'theses',
  'ouvrages_scolaires',
  'periodiques',
  'musique'
);

-- Table des professionnels (référentiel national)
CREATE TABLE IF NOT EXISTS professional_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type professional_type NOT NULL,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  registration_number TEXT UNIQUE, -- Numéro CNDP ou autre
  last_dl_number TEXT, -- Dernier numéro DL attribué pour vérification
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les demandes de dépôt légal
CREATE TABLE IF NOT EXISTS legal_deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL, -- Auto-généré
  initiator_id UUID REFERENCES professional_registry(id) NOT NULL,
  collaborator_id UUID REFERENCES professional_registry(id),
  
  -- Détails de la publication
  title TEXT NOT NULL,
  subtitle TEXT,
  author_name TEXT,
  support_type support_type NOT NULL,
  monograph_type monograph_type NOT NULL,
  language TEXT DEFAULT 'ar',
  publication_date DATE,
  page_count INTEGER,
  isbn TEXT,
  issn TEXT,
  ismn TEXT,
  
  -- Workflow et statuts
  status deposit_status DEFAULT 'brouillon',
  validation_code TEXT, -- Code 6 chiffres pour validation par B
  
  -- Numéros attribués
  dl_number TEXT UNIQUE,
  isbn_assigned TEXT UNIQUE,
  issn_assigned TEXT UNIQUE,
  ismn_assigned TEXT UNIQUE,
  attribution_date TIMESTAMP WITH TIME ZONE,
  
  -- Dates importantes
  submission_date TIMESTAMP WITH TIME ZONE,
  validation_b_date TIMESTAMP WITH TIME ZONE,
  processing_start_date TIMESTAMP WITH TIME ZONE,
  reception_date TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  documents_urls JSONB DEFAULT '[]', -- URLs des documents uploadés
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour le workflow de validation (4 gestionnaires)
CREATE TABLE IF NOT EXISTS deposit_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES legal_deposit_requests(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL, -- 1 à 4
  gestionnaire_id UUID REFERENCES auth.users(id),
  step_name TEXT NOT NULL,
  status TEXT DEFAULT 'en_attente', -- en_attente, valide, rejete
  comments TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique et la traçabilité
CREATE TABLE IF NOT EXISTS deposit_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES legal_deposit_requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- creation, validation_b, assignment, etc.
  old_status deposit_status,
  new_status deposit_status,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour la gestion des plages ISBN/ISSN par éditeur
CREATE TABLE IF NOT EXISTS number_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professional_registry(id),
  number_type TEXT NOT NULL, -- isbn, issn, ismn
  range_start TEXT NOT NULL,
  range_end TEXT NOT NULL,
  current_number TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS deposit_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES legal_deposit_requests(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE professional_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour professional_registry
CREATE POLICY "Professionals can view their own data"
  ON professional_registry FOR SELECT
  USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Professionals can update their own data"
  ON professional_registry FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all professionals"
  ON professional_registry FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour legal_deposit_requests
CREATE POLICY "Professionals can view their requests"
  ON legal_deposit_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_registry pr 
      WHERE (pr.id = initiator_id OR pr.id = collaborator_id) 
      AND pr.user_id = auth.uid()
    ) OR is_admin_or_librarian(auth.uid())
  );

CREATE POLICY "Professionals can create requests"
  ON legal_deposit_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM professional_registry pr 
      WHERE pr.id = initiator_id AND pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON legal_deposit_requests FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour les autres tables
CREATE POLICY "Admins can manage workflow steps"
  ON deposit_workflow_steps FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can view activity logs"
  ON deposit_activity_log FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage number ranges"
  ON number_ranges FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can view their notifications"
  ON deposit_notifications FOR SELECT
  USING (recipient_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  request_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(request_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM legal_deposit_requests
  WHERE request_number LIKE 'DL-' || year_part || '-%';
  
  request_num := 'DL-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN request_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_validation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer les numéros de demande
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number_trigger
  BEFORE INSERT ON legal_deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_request_number();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_professional_registry_updated_at
  BEFORE UPDATE ON professional_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_deposit_requests_updated_at
  BEFORE UPDATE ON legal_deposit_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_number_ranges_updated_at
  BEFORE UPDATE ON number_ranges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();