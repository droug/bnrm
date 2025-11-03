-- Modifier la fonction pour qu'elle appelle l'edge function d'envoi d'email
CREATE OR REPLACE FUNCTION public.notify_restoration_request_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  -- Appeler l'edge function pour envoyer l'email
  IF user_email IS NOT NULL THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-restoration-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'requestId', NEW.id,
        'recipientEmail', user_email,
        'recipientId', NEW.user_id,
        'notificationType', 'request_received',
        'requestNumber', NEW.request_number,
        'manuscriptTitle', NEW.manuscript_title
      )
    );
  END IF;
  
  -- Créer aussi une notification dans la base de données
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