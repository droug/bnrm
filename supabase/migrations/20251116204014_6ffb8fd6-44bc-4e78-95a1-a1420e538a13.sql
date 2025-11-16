-- Mettre à jour les tarifs de location pour correspondre aux tarifs de l'administration

-- S007 - Auditorium
UPDATE rental_spaces 
SET 
  hourly_rate = NULL,
  half_day_rate = 10000.00,
  full_day_rate = 15000.00
WHERE space_code = 'S007';

-- S008 - Salle de conférence
UPDATE rental_spaces 
SET 
  hourly_rate = NULL,
  half_day_rate = 5000.00,
  full_day_rate = 8000.00
WHERE space_code = 'S008';

-- S009 - Espace enfants (tarification par enfant, donc on met des tarifs journée uniquement)
UPDATE rental_spaces 
SET 
  hourly_rate = NULL,
  half_day_rate = 10.00,
  full_day_rate = 20.00,
  description = 'Espace dédié aux activités pour enfants. Tarif: 10 DH/enfant/jour (écoles publiques/associations) ou 20 DH/enfant/jour (parents/écoles privées)'
WHERE space_code = 'S009';

-- S010 - Espace jeunesse (gratuit avec Pass Jeunes, sinon 20 DH/jour)
UPDATE rental_spaces 
SET 
  hourly_rate = NULL,
  half_day_rate = 0.00,
  full_day_rate = 20.00,
  description = 'Espace pour jeunes 11-30 ans. Gratuit avec Pass Jeunes (16-30 ans), 20 DH/jour pour 11-16 ans'
WHERE space_code = 'S010';

-- S011 - Box de travail (gratuit selon bnrm_tarifs)
UPDATE rental_spaces 
SET 
  hourly_rate = NULL,
  half_day_rate = NULL,
  full_day_rate = 0.00,
  description = 'Box de travail individuel pour recherche et étude. Réservation gratuite.'
WHERE space_code = 'S011';