-- Fonction pour envoyer une notification automatique lors de la création d'une demande de restauration
CREATE OR REPLACE FUNCTION public.notify_restoration_request_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer une notification pour le demandeur
  INSERT INTO public.restoration_notifications (
    request_id,
    recipient_id,
    notification_type,
    title,
    message
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'request_received',
    'Demande de restauration enregistrée - ' || NEW.request_number,
    'Votre demande de restauration pour "' || NEW.manuscript_title || '" a bien été enregistrée. Vous serez notifié de l''avancement de votre demande.'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement une notification lors de la soumission d'une demande
CREATE TRIGGER on_restoration_request_created
  AFTER INSERT ON public.restoration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_restoration_request_created();