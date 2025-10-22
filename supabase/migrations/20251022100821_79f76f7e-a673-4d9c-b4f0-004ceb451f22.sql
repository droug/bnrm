-- ============================================================
-- MODULE: RÉSERVATION DES ESPACES CULTURELS BNRM
-- Description: Système complet de réservation d'espaces avec gestion des tarifs, équipements et disponibilités
-- ============================================================

-- Table des espaces culturels disponibles
CREATE TABLE IF NOT EXISTS public.cultural_spaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  surface_m2 NUMERIC(10,2),
  floor_level TEXT,
  has_stage BOOLEAN DEFAULT false,
  has_sound_system BOOLEAN DEFAULT false,
  has_lighting BOOLEAN DEFAULT false,
  has_projection BOOLEAN DEFAULT false,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des équipements disponibles
CREATE TABLE IF NOT EXISTS public.space_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_included BOOLEAN DEFAULT false, -- Inclus dans le tarif de base
  additional_cost NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'MAD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des services additionnels
CREATE TABLE IF NOT EXISTS public.space_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  service_type TEXT NOT NULL, -- streaming, catering, cleaning, security, media
  base_cost NUMERIC(10,2) NOT NULL,
  unit_type TEXT DEFAULT 'fixed', -- fixed, per_hour, per_participant
  currency TEXT DEFAULT 'MAD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des tarifs par espace
CREATE TABLE IF NOT EXISTS public.space_tariffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.cultural_spaces(id) ON DELETE CASCADE,
  organization_type TEXT NOT NULL, -- public, private
  duration_type TEXT NOT NULL, -- half_day, full_day, hourly
  base_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MAD',
  electricity_cost NUMERIC(10,2) DEFAULT 0,
  cleaning_cost NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des réservations (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Étape 1: Type d'organisme & espace
  organization_type TEXT NOT NULL CHECK (organization_type IN ('public', 'private')),
  space_id UUID NOT NULL REFERENCES public.cultural_spaces(id),
  justification_document_url TEXT, -- Pour organismes publics
  
  -- Étape 2: Détails de l'événement
  event_title TEXT NOT NULL,
  event_description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  participants_count INTEGER NOT NULL,
  program_document_url TEXT,
  
  -- Étape 4: Informations du demandeur
  user_id UUID REFERENCES auth.users(id),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  organization_address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Maroc',
  website TEXT,
  status_document_url TEXT, -- Pour organismes publics
  authorization_document_url TEXT, -- Autorisation supérieure (optionnel)
  
  -- Étape 5: Validation
  has_read_rules BOOLEAN DEFAULT false,
  has_accepted_conditions BOOLEAN DEFAULT false,
  
  -- Calculs financiers
  base_tariff_amount NUMERIC(10,2) DEFAULT 0,
  equipment_total_amount NUMERIC(10,2) DEFAULT 0,
  services_total_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'MAD',
  
  -- Gestion du workflow
  status TEXT DEFAULT 'en_attente' CHECK (status IN (
    'en_attente',
    'en_attente_validation',
    'confirmée',
    'rejetée',
    'en_contrat',
    'facturée',
    'réalisée',
    'annulée'
  )),
  
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_participants CHECK (participants_count > 0)
);

-- Table de liaison: équipements sélectionnés pour une réservation
CREATE TABLE IF NOT EXISTS public.booking_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.space_equipment(id),
  quantity INTEGER DEFAULT 1,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id, equipment_id)
);

-- Table de liaison: services sélectionnés pour une réservation
CREATE TABLE IF NOT EXISTS public.booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.space_services(id),
  quantity INTEGER DEFAULT 1,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id, service_id)
);

-- Table des disponibilités des espaces (blocages)
CREATE TABLE IF NOT EXISTS public.space_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id UUID NOT NULL REFERENCES public.cultural_spaces(id) ON DELETE CASCADE,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_blocked BOOLEAN DEFAULT true,
  reason TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT valid_availability_dates CHECK (end_date > start_date)
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

CREATE TRIGGER cultural_spaces_updated_at
  BEFORE UPDATE ON public.cultural_spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER space_tariffs_updated_at
  BEFORE UPDATE ON public.space_tariffs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.cultural_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_availability ENABLE ROW LEVEL SECURITY;

-- Policies pour cultural_spaces
CREATE POLICY "Tout le monde peut voir les espaces actifs"
  ON public.cultural_spaces FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les espaces"
  ON public.cultural_spaces FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour space_equipment
CREATE POLICY "Tout le monde peut voir les équipements actifs"
  ON public.space_equipment FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les équipements"
  ON public.space_equipment FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour space_services
CREATE POLICY "Tout le monde peut voir les services actifs"
  ON public.space_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les services"
  ON public.space_services FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour space_tariffs
CREATE POLICY "Tout le monde peut voir les tarifs actifs"
  ON public.space_tariffs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les tarifs"
  ON public.space_tariffs FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour bookings
CREATE POLICY "Utilisateurs peuvent créer leurs réservations"
  ON public.bookings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    has_read_rules = true AND
    has_accepted_conditions = true
  );

CREATE POLICY "Utilisateurs peuvent voir leurs réservations"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Utilisateurs peuvent modifier leurs réservations en attente"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = user_id AND
    status = 'en_attente'
  );

CREATE POLICY "Admins peuvent gérer toutes les réservations"
  ON public.bookings FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour booking_equipment
CREATE POLICY "Utilisateurs peuvent gérer leurs équipements de réservation"
  ON public.booking_equipment FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_equipment.booking_id
      AND bookings.user_id = auth.uid()
    )
    OR is_admin_or_librarian(auth.uid())
  );

-- Policies pour booking_services
CREATE POLICY "Utilisateurs peuvent gérer leurs services de réservation"
  ON public.booking_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_services.booking_id
      AND bookings.user_id = auth.uid()
    )
    OR is_admin_or_librarian(auth.uid())
  );

-- Policies pour space_availability
CREATE POLICY "Tout le monde peut voir les disponibilités"
  ON public.space_availability FOR SELECT
  USING (true);

CREATE POLICY "Admins peuvent gérer les disponibilités"
  ON public.space_availability FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Insérer les espaces culturels
INSERT INTO public.cultural_spaces (name, description, capacity, surface_m2, has_stage, has_sound_system, has_lighting, has_projection) VALUES
  ('Auditorium', 'Grand auditorium avec scène et équipement complet', 500, 600, true, true, true, true),
  ('Salle de conférences', 'Salle moderne pour conférences et séminaires', 150, 200, false, true, true, true),
  ('Espace d''exposition / Hall', 'Grand hall pour expositions et événements', 300, 400, false, false, true, false),
  ('Atelier de formation', 'Espace modulable pour ateliers et formations', 50, 80, false, true, true, true),
  ('Salle de séminaire / réunion / annexe', 'Salle polyvalente pour réunions', 30, 60, false, true, true, false),
  ('Esplanade S1', 'Espace extérieur S1', 200, 300, false, false, false, false),
  ('Esplanade S2', 'Espace extérieur S2', 200, 300, false, false, false, false),
  ('Esplanade S3', 'Espace extérieur S3', 200, 300, false, false, false, false),
  ('Esplanade S4', 'Espace extérieur S4', 200, 300, false, false, false, false),
  ('Studio de tournage', 'Espace équipé pour tournage d''émissions', 80, 120, true, true, true, false);

-- Insérer les équipements
INSERT INTO public.space_equipment (name, description, is_included, additional_cost) VALUES
  ('Vidéoprojecteur', 'Projecteur haute définition', true, 0),
  ('Sonorisation', 'Système audio complet', true, 0),
  ('Pupitre', 'Pupitre de conférence', true, 0),
  ('Scène', 'Scène modulable', false, 500),
  ('Micro HF', 'Microphone sans fil', false, 200),
  ('Éclairage professionnel', 'Système d''éclairage avancé', false, 800),
  ('Ordinateurs', 'Postes informatiques', false, 150),
  ('Écran géant LED', 'Grand écran LED', false, 1000),
  ('Table ronde', 'Tables de réunion', true, 0),
  ('Chaises supplémentaires', 'Sièges additionnels', false, 50);

-- Insérer les services additionnels
INSERT INTO public.space_services (name, description, service_type, base_cost, unit_type) VALUES
  ('Streaming / Captation vidéo', 'Diffusion en direct et enregistrement', 'streaming', 2000, 'fixed'),
  ('Pause-café', 'Service de rafraîchissements', 'catering', 50, 'per_participant'),
  ('Traiteur', 'Service de restauration complet', 'catering', 150, 'per_participant'),
  ('Couverture médiatique', 'Service de communication et presse', 'media', 1500, 'fixed'),
  ('Nettoyage renforcé', 'Nettoyage approfondi après événement', 'cleaning', 500, 'fixed'),
  ('Sécurité', 'Personnel de sécurité', 'security', 300, 'per_hour'),
  ('Surveillance technique', 'Technicien sur place', 'security', 400, 'per_hour'),
  ('Hôtesse d''accueil', 'Personnel d''accueil', 'services', 200, 'per_hour');

-- Insérer des tarifs de base pour chaque espace
INSERT INTO public.space_tariffs (space_id, organization_type, duration_type, base_price, electricity_cost, cleaning_cost)
SELECT 
  id,
  'public',
  'full_day',
  CASE 
    WHEN name LIKE '%Auditorium%' THEN 5000
    WHEN name LIKE '%Conférence%' THEN 3000
    WHEN name LIKE '%Exposition%' THEN 4000
    WHEN name LIKE '%Atelier%' THEN 1500
    WHEN name LIKE '%Séminaire%' THEN 1000
    WHEN name LIKE '%Esplanade%' THEN 2000
    WHEN name LIKE '%tournage%' THEN 3500
    ELSE 2000
  END,
  500,
  300
FROM public.cultural_spaces;

INSERT INTO public.space_tariffs (space_id, organization_type, duration_type, base_price, electricity_cost, cleaning_cost)
SELECT 
  id,
  'private',
  'full_day',
  CASE 
    WHEN name LIKE '%Auditorium%' THEN 8000
    WHEN name LIKE '%Conférence%' THEN 5000
    WHEN name LIKE '%Exposition%' THEN 6000
    WHEN name LIKE '%Atelier%' THEN 2500
    WHEN name LIKE '%Séminaire%' THEN 1800
    WHEN name LIKE '%Esplanade%' THEN 3500
    WHEN name LIKE '%tournage%' THEN 5000
    ELSE 3000
  END,
  800,
  500
FROM public.cultural_spaces;

-- Tarifs demi-journée
INSERT INTO public.space_tariffs (space_id, organization_type, duration_type, base_price, electricity_cost, cleaning_cost)
SELECT 
  id,
  'public',
  'half_day',
  CASE 
    WHEN name LIKE '%Auditorium%' THEN 3000
    WHEN name LIKE '%Conférence%' THEN 1800
    WHEN name LIKE '%Exposition%' THEN 2500
    WHEN name LIKE '%Atelier%' THEN 900
    WHEN name LIKE '%Séminaire%' THEN 600
    WHEN name LIKE '%Esplanade%' THEN 1200
    WHEN name LIKE '%tournage%' THEN 2000
    ELSE 1200
  END,
  300,
  200
FROM public.cultural_spaces;

INSERT INTO public.space_tariffs (space_id, organization_type, duration_type, base_price, electricity_cost, cleaning_cost)
SELECT 
  id,
  'private',
  'half_day',
  CASE 
    WHEN name LIKE '%Auditorium%' THEN 5000
    WHEN name LIKE '%Conférence%' THEN 3000
    WHEN name LIKE '%Exposition%' THEN 3500
    WHEN name LIKE '%Atelier%' THEN 1500
    WHEN name LIKE '%Séminaire%' THEN 1000
    WHEN name LIKE '%Esplanade%' THEN 2000
    WHEN name LIKE '%tournage%' THEN 3000
    ELSE 1800
  END,
  500,
  300
FROM public.cultural_spaces;

-- Créer des index pour améliorer les performances
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_space_id ON public.bookings(space_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_dates ON public.bookings(start_date, end_date);
CREATE INDEX idx_space_availability_dates ON public.space_availability(space_id, start_date, end_date);
CREATE INDEX idx_booking_equipment_booking ON public.booking_equipment(booking_id);
CREATE INDEX idx_booking_services_booking ON public.booking_services(booking_id);