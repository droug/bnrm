-- Ajouter les champs de tarification aux espaces culturels
ALTER TABLE cultural_spaces
ADD COLUMN IF NOT EXISTS tariff_public_full_day NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tariff_public_half_day NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tariff_private_full_day NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tariff_private_half_day NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS allows_half_day BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS electricity_charge NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cleaning_charge NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS space_type TEXT DEFAULT 'salle';

-- Créer un commentaire pour les types d'espaces
COMMENT ON COLUMN cultural_spaces.space_type IS 'Type d''espace: salle, esplanade';

-- Ajouter un champ pour le type de durée dans bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS duration_type TEXT DEFAULT 'journee_complete';

-- Créer un commentaire
COMMENT ON COLUMN bookings.duration_type IS 'Type de durée: demi_journee, journee_complete';

-- Créer une fonction pour vérifier la disponibilité d'un espace
CREATE OR REPLACE FUNCTION check_space_availability(
  p_space_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  -- Vérifier les réservations existantes qui se chevauchent
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM bookings
  WHERE space_id = p_space_id
    AND status IN ('en_attente', 'en_attente_validation', 'confirmée', 'en_contrat')
    AND (
      -- Chevauchement de dates
      (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
    )
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
  
  -- Vérifier les blocages de disponibilité
  SELECT COUNT(*) + v_conflict_count
  INTO v_conflict_count
  FROM space_availability
  WHERE space_id = p_space_id
    AND is_blocked = true
    AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date);
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Fonction pour calculer automatiquement le tarif d'une réservation
CREATE OR REPLACE FUNCTION calculate_booking_tariff(
  p_space_id UUID,
  p_organization_type TEXT,
  p_duration_type TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_space RECORD;
  v_base_tariff NUMERIC := 0;
  v_days_count NUMERIC;
BEGIN
  -- Récupérer les informations de l'espace
  SELECT * INTO v_space
  FROM cultural_spaces
  WHERE id = p_space_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculer le nombre de jours
  v_days_count := EXTRACT(DAY FROM (p_end_date - p_start_date)) + 1;
  
  -- Déterminer le tarif de base selon le type d'organisme et la durée
  IF p_organization_type = 'public' THEN
    IF p_duration_type = 'demi_journee' AND v_space.allows_half_day THEN
      v_base_tariff := v_space.tariff_public_half_day;
    ELSE
      v_base_tariff := v_space.tariff_public_full_day * v_days_count;
    END IF;
  ELSE -- private
    IF p_duration_type = 'demi_journee' AND v_space.allows_half_day THEN
      v_base_tariff := v_space.tariff_private_half_day;
    ELSE
      v_base_tariff := v_space.tariff_private_full_day * v_days_count;
    END IF;
  END IF;
  
  -- Ajouter les charges additionnelles automatiques
  v_base_tariff := v_base_tariff + 
                   COALESCE(v_space.electricity_charge, 0) + 
                   COALESCE(v_space.cleaning_charge, 0);
  
  RETURN v_base_tariff;
END;
$$;

-- Mettre à jour les espaces existants avec des tarifs par défaut
UPDATE cultural_spaces
SET 
  tariff_public_full_day = 0,
  tariff_public_half_day = 0,
  tariff_private_full_day = 0,
  tariff_private_half_day = 0,
  allows_half_day = false,
  electricity_charge = 0,
  cleaning_charge = 0,
  space_type = 'salle'
WHERE tariff_public_full_day IS NULL;