-- Table des créneaux de visites guidées
CREATE TABLE IF NOT EXISTS public.visits_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  heure TIME NOT NULL,
  langue TEXT NOT NULL CHECK (langue IN ('arabe', 'français', 'anglais', 'amazigh')),
  capacite_max INTEGER NOT NULL DEFAULT 30,
  reservations_actuelles INTEGER NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'disponible' CHECK (statut IN ('disponible', 'complet', 'annule')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, heure, langue)
);

-- Table des réservations de visites guidées
CREATE TABLE IF NOT EXISTS public.visits_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.visits_slots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  organisme TEXT,
  nb_visiteurs INTEGER NOT NULL CHECK (nb_visiteurs > 0),
  langue TEXT NOT NULL CHECK (langue IN ('arabe', 'français', 'anglais', 'amazigh')),
  commentaire TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirmee', 'annulee')),
  confirmation_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_visits_slots_date ON public.visits_slots(date);
CREATE INDEX IF NOT EXISTS idx_visits_slots_statut ON public.visits_slots(statut);
CREATE INDEX IF NOT EXISTS idx_visits_bookings_email ON public.visits_bookings(email);
CREATE INDEX IF NOT EXISTS idx_visits_bookings_statut ON public.visits_bookings(statut);

-- Fonction pour vérifier la limite de réservations actives par email
CREATE OR REPLACE FUNCTION check_active_bookings_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM public.visits_bookings
  WHERE email = NEW.email
  AND statut IN ('en_attente', 'confirmee');
  
  IF active_count >= 2 THEN
    RAISE EXCEPTION 'Vous avez déjà 2 réservations actives. Veuillez annuler une réservation existante.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier la limite avant insertion
CREATE TRIGGER check_booking_limit_trigger
BEFORE INSERT ON public.visits_bookings
FOR EACH ROW
EXECUTE FUNCTION check_active_bookings_limit();

-- Fonction pour mettre à jour le statut du créneau
CREATE OR REPLACE FUNCTION update_slot_status()
RETURNS TRIGGER AS $$
DECLARE
  slot_record RECORD;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrémenter les réservations actuelles
    UPDATE public.visits_slots
    SET reservations_actuelles = reservations_actuelles + NEW.nb_visiteurs,
        updated_at = NOW()
    WHERE id = NEW.slot_id;
    
    -- Vérifier si le créneau est maintenant complet
    SELECT * INTO slot_record FROM public.visits_slots WHERE id = NEW.slot_id;
    IF slot_record.reservations_actuelles >= slot_record.capacite_max THEN
      UPDATE public.visits_slots
      SET statut = 'complet'
      WHERE id = NEW.slot_id;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.statut != 'annulee' AND NEW.statut = 'annulee' THEN
    -- Décrémenter les réservations actuelles lors d'une annulation
    UPDATE public.visits_slots
    SET reservations_actuelles = GREATEST(0, reservations_actuelles - OLD.nb_visiteurs),
        statut = CASE 
          WHEN reservations_actuelles - OLD.nb_visiteurs < capacite_max THEN 'disponible'
          ELSE statut
        END,
        updated_at = NOW()
    WHERE id = OLD.slot_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour gérer le statut du créneau
CREATE TRIGGER update_slot_status_trigger
AFTER INSERT OR UPDATE ON public.visits_bookings
FOR EACH ROW
EXECUTE FUNCTION update_slot_status();

-- Fonction pour générer un token de confirmation unique
CREATE OR REPLACE FUNCTION generate_confirmation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_token IS NULL THEN
    NEW.confirmation_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer le token
CREATE TRIGGER generate_token_trigger
BEFORE INSERT ON public.visits_bookings
FOR EACH ROW
EXECUTE FUNCTION generate_confirmation_token();

-- RLS Policies
ALTER TABLE public.visits_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits_bookings ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les créneaux disponibles
CREATE POLICY "Les créneaux sont visibles par tous"
ON public.visits_slots FOR SELECT
USING (true);

-- Les administrateurs peuvent gérer les créneaux
CREATE POLICY "Les admins peuvent gérer les créneaux"
ON public.visits_slots FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Les utilisateurs peuvent créer leurs propres réservations
CREATE POLICY "Les utilisateurs peuvent créer des réservations"
ON public.visits_bookings FOR INSERT
WITH CHECK (true);

-- Les utilisateurs peuvent voir leurs propres réservations
CREATE POLICY "Les utilisateurs peuvent voir leurs réservations"
ON public.visits_bookings FOR SELECT
USING (
  auth.uid() = user_id 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.is_admin_or_librarian(auth.uid())
);

-- Les utilisateurs peuvent annuler leurs propres réservations
CREATE POLICY "Les utilisateurs peuvent annuler leurs réservations"
ON public.visits_bookings FOR UPDATE
USING (
  auth.uid() = user_id 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR public.is_admin_or_librarian(auth.uid())
)
WITH CHECK (statut IN ('en_attente', 'confirmee', 'annulee'));

-- Les admins peuvent tout gérer
CREATE POLICY "Les admins peuvent gérer les réservations"
ON public.visits_bookings FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));