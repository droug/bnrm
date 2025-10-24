-- Reset all bookings to "en_attente" status
UPDATE public.bookings
SET 
  status = 'en_attente',
  current_step_code = NULL,
  current_step_order = NULL,
  workflow_started_at = NULL,
  workflow_completed_at = NULL
WHERE status != 'en_attente';

-- Clear workflow history
DELETE FROM public.booking_workflow_history;