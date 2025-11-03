-- Simplifier la fonction de notification pour ne plus utiliser les appels HTTP
-- Le frontend gère déjà l'envoi des emails
CREATE OR REPLACE FUNCTION public.notify_restoration_request_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Créer uniquement une notification dans la base de données
  -- L'email est géré par le frontend
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
$function$;