-- Supprimer l'ancienne salle
UPDATE cultural_spaces 
SET is_active = false 
WHERE name = 'Salle de séminaire / réunion / annexe';

-- Ajouter les trois nouvelles salles
INSERT INTO cultural_spaces (
  name, 
  description, 
  capacity, 
  surface_m2, 
  space_type, 
  has_stage, 
  has_sound_system, 
  has_lighting, 
  has_projection,
  allows_half_day,
  is_active,
  tariff_public_full_day,
  tariff_public_half_day,
  tariff_private_full_day,
  tariff_private_half_day,
  electricity_charge,
  cleaning_charge
) VALUES 
  (
    'Salle séminaire', 
    'Salle équipée pour séminaires', 
    30, 
    60.00, 
    'salle', 
    false, 
    true, 
    true, 
    false,
    false,
    true,
    0,
    0,
    0,
    0,
    0,
    0
  ),
  (
    'Salle de réunion', 
    'Salle pour réunions', 
    30, 
    60.00, 
    'salle', 
    false, 
    true, 
    true, 
    false,
    false,
    true,
    0,
    0,
    0,
    0,
    0,
    0
  ),
  (
    'Salle de l''annexe', 
    'Salle située dans l''annexe', 
    30, 
    60.00, 
    'salle', 
    false, 
    true, 
    true, 
    false,
    false,
    true,
    0,
    0,
    0,
    0,
    0,
    0
  );