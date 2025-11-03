-- Modifier la fonction pour envoyer une notification quand le statut passe à 'autorisee'
CREATE OR REPLACE FUNCTION public.track_restoration_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Enregistrer le changement dans l'historique
    INSERT INTO public.restoration_request_history (
      request_id,
      previous_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.validation_notes
    );
    
    -- Si le statut passe à 'autorisee', envoyer une notification
    IF NEW.status = 'autorisee' THEN
      -- Récupérer l'email de l'utilisateur
      SELECT email INTO v_user_email
      FROM auth.users
      WHERE id = NEW.user_id;
      
      -- Envoyer la notification via l'edge function
      PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/send-restoration-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key')
        ),
        body := jsonb_build_object(
          'requestId', NEW.id,
          'recipientEmail', v_user_email,
          'recipientId', NEW.user_id,
          'notificationType', 'authorized_deposit_request',
          'requestNumber', NEW.request_number,
          'manuscriptTitle', NEW.manuscript_title
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;