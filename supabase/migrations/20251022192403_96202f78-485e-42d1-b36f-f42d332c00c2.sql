-- Fonction pour vérifier la capacité d'un créneau
CREATE OR REPLACE FUNCTION check_slot_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  slot_record RECORD;
  current_bookings INTEGER;
BEGIN
  -- Récupérer les informations du créneau
  SELECT * INTO slot_record 
  FROM visits_slots 
  WHERE id = NEW.slot_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Créneau non trouvé';
  END IF;
  
  -- Calculer le nombre de visiteurs déjà réservés (hors annulations)
  SELECT COALESCE(SUM(nb_visiteurs), 0) INTO current_bookings
  FROM visits_bookings
  WHERE slot_id = NEW.slot_id
  AND statut IN ('en_attente', 'confirmee');
  
  -- Vérifier si l'ajout dépasse la capacité
  IF (current_bookings + NEW.nb_visiteurs) > slot_record.capacite_max THEN
    RAISE EXCEPTION 'La capacité maximale du créneau est dépassée. Capacité: %, Réservé: %, Demandé: %', 
      slot_record.capacite_max, current_bookings, NEW.nb_visiteurs;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger de vérification de capacité (avant le trigger de limite active)
DROP TRIGGER IF EXISTS check_slot_capacity_trigger ON visits_bookings;
CREATE TRIGGER check_slot_capacity_trigger
BEFORE INSERT ON visits_bookings
FOR EACH ROW
EXECUTE FUNCTION check_slot_capacity();

-- Modifier le trigger check_active_bookings_limit pour qu'il s'exécute après
DROP TRIGGER IF EXISTS check_active_bookings_limit_trigger ON visits_bookings;
CREATE TRIGGER check_active_bookings_limit_trigger
BEFORE INSERT ON visits_bookings
FOR EACH ROW
EXECUTE FUNCTION check_active_bookings_limit();

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_visits_bookings_email_status 
ON visits_bookings(email, statut) 
WHERE statut IN ('en_attente', 'confirmee');

CREATE INDEX IF NOT EXISTS idx_visits_bookings_slot_status 
ON visits_bookings(slot_id, statut) 
WHERE statut IN ('en_attente', 'confirmee');

-- Améliorer la fonction de mise à jour du statut des créneaux
CREATE OR REPLACE FUNCTION update_slot_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  slot_record RECORD;
  current_bookings INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Récupérer les informations du créneau
    SELECT * INTO slot_record FROM visits_slots WHERE id = NEW.slot_id;
    
    -- Calculer les réservations actuelles
    SELECT COALESCE(SUM(nb_visiteurs), 0) INTO current_bookings
    FROM visits_bookings
    WHERE slot_id = NEW.slot_id
    AND statut IN ('en_attente', 'confirmee');
    
    -- Mettre à jour le créneau
    UPDATE visits_slots
    SET 
      reservations_actuelles = current_bookings,
      statut = CASE 
        WHEN current_bookings >= capacite_max THEN 'complet'
        ELSE 'disponible'
      END,
      updated_at = NOW()
    WHERE id = NEW.slot_id;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.statut != 'annulee' AND NEW.statut = 'annulee' THEN
    -- Lors d'une annulation, recalculer les réservations
    SELECT COALESCE(SUM(nb_visiteurs), 0) INTO current_bookings
    FROM visits_bookings
    WHERE slot_id = OLD.slot_id
    AND statut IN ('en_attente', 'confirmee');
    
    UPDATE visits_slots
    SET 
      reservations_actuelles = current_bookings,
      statut = CASE 
        WHEN current_bookings >= capacite_max THEN 'complet'
        ELSE 'disponible'
      END,
      updated_at = NOW()
    WHERE id = OLD.slot_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Politique RLS pour permettre l'annulation via token
CREATE POLICY "Users can cancel bookings with token"
ON visits_bookings
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
  statut = 'annulee' AND 
  (
    -- Via token de confirmation
    confirmation_token IS NOT NULL
    OR 
    -- Via auth si connecté
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  )
);