-- Création de la table pour les espaces locatifs
CREATE TABLE IF NOT EXISTS public.rental_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_code TEXT UNIQUE NOT NULL,
  space_name TEXT NOT NULL,
  space_name_ar TEXT,
  description TEXT,
  capacity INTEGER,
  equipment TEXT[],
  hourly_rate NUMERIC(10,2),
  half_day_rate NUMERIC(10,2),
  full_day_rate NUMERIC(10,2),
  currency TEXT DEFAULT 'DH',
  is_active BOOLEAN DEFAULT true,
  availability_schedule JSONB,
  images TEXT[],
  location TEXT,
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création de la table pour les demandes de location
CREATE TABLE IF NOT EXISTS public.rental_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  space_id UUID REFERENCES public.rental_spaces(id),
  
  -- Informations sur l'événement
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT NOT NULL,
  
  -- Informations sur l'organisation
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('public', 'private', 'association', 'individual')),
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  organization_address TEXT,
  
  -- Dates et horaires
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  rental_duration_type TEXT CHECK (rental_duration_type IN ('hourly', 'half_day', 'full_day', 'multi_day')),
  
  -- Participants
  expected_participants INTEGER,
  
  -- Services additionnels demandés
  equipment_needs TEXT[],
  catering_required BOOLEAN DEFAULT false,
  technical_support_required BOOLEAN DEFAULT false,
  additional_notes TEXT,
  
  -- Documents
  authorization_document_url TEXT,
  program_document_url TEXT,
  insurance_document_url TEXT,
  
  -- Tarification
  base_amount NUMERIC(10,2),
  equipment_amount NUMERIC(10,2),
  services_amount NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'DH',
  
  -- Statut et workflow
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'under_review', 
    'availability_check',
    'approved', 
    'rejected', 
    'confirmed',
    'payment_pending',
    'paid',
    'completed',
    'cancelled'
  )),
  
  -- Validation
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  validation_notes TEXT,
  
  -- Disponibilité
  availability_confirmed BOOLEAN DEFAULT false,
  availability_checked_by UUID REFERENCES auth.users(id),
  availability_checked_at TIMESTAMPTZ,
  
  -- Conditions
  terms_accepted BOOLEAN DEFAULT false,
  insurance_confirmed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création de la table pour l'historique des statuts
CREATE TABLE IF NOT EXISTS public.rental_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fonction pour générer le numéro de demande
CREATE OR REPLACE FUNCTION public.generate_rental_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  request_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(request_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM rental_requests
  WHERE request_number LIKE 'LOC-' || year_part || '-%';
  
  request_num := 'LOC-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN request_num;
END;
$$;

-- Trigger pour définir automatiquement le numéro de demande
CREATE OR REPLACE FUNCTION public.set_rental_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_rental_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_rental_request_number_trigger
  BEFORE INSERT ON public.rental_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_rental_request_number();

-- Trigger pour l'historique des changements de statut
CREATE OR REPLACE FUNCTION public.track_rental_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.rental_request_history (
      request_id,
      previous_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.validation_notes
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER track_rental_status_changes_trigger
  AFTER UPDATE ON public.rental_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION track_rental_status_changes();

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_rental_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rental_requests_updated_at_trigger
  BEFORE UPDATE ON public.rental_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_requests_updated_at();

CREATE TRIGGER update_rental_spaces_updated_at_trigger
  BEFORE UPDATE ON public.rental_spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_requests_updated_at();

-- Enable RLS
ALTER TABLE public.rental_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_request_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour rental_spaces
CREATE POLICY "Les espaces sont visibles par tous"
  ON public.rental_spaces
  FOR SELECT
  USING (is_active = true OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Seuls les admins peuvent gérer les espaces"
  ON public.rental_spaces
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour rental_requests
CREATE POLICY "Les utilisateurs voient leurs propres demandes"
  ON public.rental_requests
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_admin_or_librarian(auth.uid())
  );

CREATE POLICY "Les utilisateurs peuvent créer des demandes"
  ON public.rental_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs demandes en attente"
  ON public.rental_requests
  FOR UPDATE
  USING (
    (auth.uid() = user_id AND status IN ('pending', 'under_review'))
    OR is_admin_or_librarian(auth.uid())
  );

CREATE POLICY "Seuls les admins peuvent supprimer"
  ON public.rental_requests
  FOR DELETE
  USING (is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour rental_request_history
CREATE POLICY "L'historique est visible aux admins et aux propriétaires"
  ON public.rental_request_history
  FOR SELECT
  USING (
    is_admin_or_librarian(auth.uid())
    OR auth.uid() IN (
      SELECT user_id FROM rental_requests WHERE id = request_id
    )
  );

-- Insérer des espaces de démonstration
INSERT INTO public.rental_spaces (space_code, space_name, space_name_ar, description, capacity, equipment, hourly_rate, half_day_rate, full_day_rate, location, rules) VALUES
('S007', 'Auditorium', 'القاعة الكبرى', 'Espace polyvalent équipé pour conférences, projections et événements culturels', 300, ARRAY['Système audio professionnel', 'Vidéoprojecteur HD', 'Écran géant', 'Podium', 'Éclairage scénique'], 2000.00, 8000.00, 15000.00, 'Niveau 1, Aile Est', 'Interdiction de fumer. Respect des horaires. Assurance obligatoire.'),
('S008', 'Salle de conférence', 'قاعة المؤتمرات', 'Salle moderne pour réunions et conférences professionnelles', 80, ARRAY['Écrans LCD', 'Système de visioconférence', 'Wifi haut débit', 'Tables modulables'], 800.00, 3000.00, 5000.00, 'Niveau 2, Aile Ouest', 'Configuration en U ou théâtre possible. Matériel audiovisuel inclus.'),
('S009', 'Espace enfants', 'فضاء الأطفال', 'Espace dédié aux activités pour enfants et ateliers pédagogiques', 50, ARRAY['Tapis de sol', 'Chaises enfants', 'Tableaux interactifs', 'Matériel pédagogique'], 500.00, 1500.00, 2500.00, 'Rez-de-chaussée, Aile Sud', 'Surveillance obligatoire. Activités adaptées 3-12 ans.'),
('S010', 'Espace jeunesse', 'فضاء الشباب', 'Espace moderne pour activités jeunesse et ateliers créatifs', 60, ARRAY['Ordinateurs', 'Projecteur', 'Matériel créatif', 'Tables de travail'], 600.00, 2000.00, 3500.00, 'Niveau 1, Aile Nord', 'Idéal pour ateliers numériques et activités créatives.'),
('S011', 'Box de travail', 'مكتب العمل الخاص', 'Espaces de travail privatifs pour sessions individuelles ou petits groupes', 6, ARRAY['Bureau', 'Chaises', 'Wifi', 'Prises électriques', 'Tableau blanc'], 100.00, 300.00, 500.00, 'Niveau 3, Zone silencieuse', 'Réservation par créneaux de 2h minimum. Silence obligatoire.');

-- Créer des index pour améliorer les performances
CREATE INDEX idx_rental_requests_user_id ON public.rental_requests(user_id);
CREATE INDEX idx_rental_requests_space_id ON public.rental_requests(space_id);
CREATE INDEX idx_rental_requests_status ON public.rental_requests(status);
CREATE INDEX idx_rental_requests_dates ON public.rental_requests(start_date, end_date);
CREATE INDEX idx_rental_request_history_request_id ON public.rental_request_history(request_id);