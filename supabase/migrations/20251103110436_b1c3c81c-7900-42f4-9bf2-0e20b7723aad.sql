-- Créer un trigger pour envoyer automatiquement une notification email
-- lors de la création d'une demande de restauration

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS trigger_restoration_request_created ON public.restoration_requests;

-- Créer le trigger
CREATE TRIGGER trigger_restoration_request_created
  AFTER INSERT ON public.restoration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_restoration_request_created();