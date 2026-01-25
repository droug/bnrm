-- =============================================
-- SYSTÈME MÉCÉNAT COMPLET - DONATEURS & DONATIONS
-- =============================================

-- Table des donateurs (référentiel)
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_type TEXT NOT NULL CHECK (donor_type IN ('individual', 'institution', 'association')),
  first_name TEXT,
  last_name TEXT,
  organization_name TEXT,
  biography TEXT,
  biography_ar TEXT,
  photo_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Maroc',
  website TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des donations (œuvres données)
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  donation_number TEXT UNIQUE,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  support_type TEXT NOT NULL, -- manuscrits, livres, périodiques, archives, photos, audiovisuel, autre
  thematic TEXT[], -- thématiques couvertes
  estimated_quantity INTEGER,
  oldest_item_date TEXT, -- date approximative de l'ouvrage le plus ancien
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  historical_value TEXT,
  images JSONB DEFAULT '[]'::jsonb, -- URLs des images des œuvres
  documents JSONB DEFAULT '[]'::jsonb, -- inventaires, photos
  cataloged_items_count INTEGER DEFAULT 0,
  donation_date DATE,
  reception_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'cataloged', 'rejected', 'archived')),
  validation_notes TEXT,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des œuvres individuelles d'une donation (pour présentation détaillée)
CREATE TABLE public.donation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT,
  publication_year TEXT,
  support_type TEXT,
  description TEXT,
  image_url TEXT,
  catalog_number TEXT, -- numéro de catalogue BNRM si catalogué
  is_digitized BOOLEAN DEFAULT false,
  digital_library_id UUID, -- lien vers la bibliothèque numérique si numérisé
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des propositions de dons (futurs donateurs)
CREATE TABLE public.donation_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  proposal_number TEXT UNIQUE,
  -- Informations donateur
  donor_type TEXT NOT NULL CHECK (donor_type IN ('individual', 'institution', 'association')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Maroc',
  -- Informations sur la donation proposée
  support_type TEXT NOT NULL,
  thematics TEXT[], -- thématiques couvertes (menu déroulant)
  estimated_books_count INTEGER,
  estimated_pages_count INTEGER,
  oldest_item_date TEXT, -- date approximative de l'ouvrage le plus ancien
  collection_description TEXT NOT NULL,
  historical_value TEXT,
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  documents JSONB DEFAULT '[]'::jsonb, -- fichiers uploadés
  -- Workflow
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'accepted', 'rejected', 'converted')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  converted_donation_id UUID REFERENCES public.donations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des contacts avec les donateurs
CREATE TABLE public.donor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES public.donation_proposals(id) ON DELETE CASCADE,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'phone', 'meeting', 'letter', 'other')),
  subject TEXT,
  content TEXT,
  direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes pour performances
CREATE INDEX idx_donors_email ON public.donors(email);
CREATE INDEX idx_donors_status ON public.donors(status);
CREATE INDEX idx_donors_type ON public.donors(donor_type);
CREATE INDEX idx_donors_featured ON public.donors(is_featured) WHERE is_featured = true;
CREATE INDEX idx_donations_donor ON public.donations(donor_id);
CREATE INDEX idx_donations_status ON public.donations(status);
CREATE INDEX idx_donations_date ON public.donations(donation_date);
CREATE INDEX idx_donations_support_type ON public.donations(support_type);
CREATE INDEX idx_donation_items_donation ON public.donation_items(donation_id);
CREATE INDEX idx_donation_proposals_status ON public.donation_proposals(status);
CREATE INDEX idx_donation_proposals_user ON public.donation_proposals(user_id);

-- Enable RLS
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour donors
CREATE POLICY "Public can view featured non-anonymous donors" ON public.donors
  FOR SELECT USING (status = 'active' AND is_anonymous = false);

CREATE POLICY "Admins can manage all donors" ON public.donors
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Donors can view their own profile" ON public.donors
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Donors can update their own profile" ON public.donors
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies pour donations
CREATE POLICY "Public can view accepted donations" ON public.donations
  FOR SELECT USING (status IN ('accepted', 'cataloged', 'archived'));

CREATE POLICY "Admins can manage all donations" ON public.donations
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Donors can view their own donations" ON public.donations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.donors WHERE id = donor_id AND user_id = auth.uid())
  );

-- RLS Policies pour donation_items
CREATE POLICY "Public can view items of accepted donations" ON public.donation_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.donations WHERE id = donation_id AND status IN ('accepted', 'cataloged', 'archived'))
  );

CREATE POLICY "Admins can manage all donation items" ON public.donation_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

-- RLS Policies pour donation_proposals
CREATE POLICY "Users can submit proposals" ON public.donation_proposals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own proposals" ON public.donation_proposals
  FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Users can update their pending proposals" ON public.donation_proposals
  FOR UPDATE USING (user_id = auth.uid() AND status = 'submitted');

CREATE POLICY "Admins can manage all proposals" ON public.donation_proposals
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

-- RLS Policies pour donor_communications
CREATE POLICY "Admins can manage communications" ON public.donor_communications
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'librarian'));

CREATE POLICY "Donors can view their communications" ON public.donor_communications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.donors WHERE id = donor_id AND user_id = auth.uid())
  );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_mecenat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donors_updated_at
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION update_mecenat_updated_at();

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION update_mecenat_updated_at();

CREATE TRIGGER update_donation_proposals_updated_at
  BEFORE UPDATE ON public.donation_proposals
  FOR EACH ROW EXECUTE FUNCTION update_mecenat_updated_at();

-- Fonction pour générer les numéros de donation
CREATE OR REPLACE FUNCTION generate_donation_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(donation_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM donations
  WHERE donation_number LIKE 'DON-' || year_part || '-%';
  RETURN 'DON-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(proposal_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM donation_proposals
  WHERE proposal_number LIKE 'PROP-' || year_part || '-%';
  RETURN 'PROP-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers pour numérotation automatique
CREATE OR REPLACE FUNCTION set_donation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.donation_number IS NULL THEN
    NEW.donation_number := generate_donation_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_donation_number_trigger
  BEFORE INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION set_donation_number();

CREATE OR REPLACE FUNCTION set_proposal_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_number IS NULL THEN
    NEW.proposal_number := generate_proposal_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_proposal_number_trigger
  BEFORE INSERT ON public.donation_proposals
  FOR EACH ROW EXECUTE FUNCTION set_proposal_number();