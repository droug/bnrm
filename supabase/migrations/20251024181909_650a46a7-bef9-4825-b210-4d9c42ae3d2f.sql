-- Réinitialiser les 3 réservations à l'état "En attente"
UPDATE bookings 
SET 
  status = 'en_attente', 
  current_step_code = 'e01_reception', 
  current_step_order = 1
WHERE id IN (
  '2546564e-9a28-46b7-8d07-ce7501aa7ff5',
  '5d9e4c98-2248-4ee0-8d08-85443ad4c8b3',
  '82675575-50c8-4e4f-a15b-e3a085efb4d6'
);