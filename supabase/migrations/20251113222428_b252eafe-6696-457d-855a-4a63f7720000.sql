-- Créer une fonction pour envoyer les notifications via edge function
CREATE OR REPLACE FUNCTION notify_workflow_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_type TEXT;
  recipient_email TEXT;
  request_type TEXT;
BEGIN
  -- Déterminer le type de notification et l'email du destinataire selon la table
  CASE TG_TABLE_NAME
    WHEN 'partnerships' THEN
      request_type := 'partnership';
      recipient_email := NEW.email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'legal_deposit_requests' THEN
      request_type := 'legal_deposit';
      recipient_email := NEW.email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'reproduction_requests' THEN
      request_type := 'reproduction';
      recipient_email := NEW.email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'bookings' THEN
      request_type := 'booking';
      recipient_email := NEW.contact_email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'visits_bookings' THEN
      request_type := 'visit';
      recipient_email := NEW.email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.statut IS DISTINCT FROM NEW.statut THEN
        notification_type := NEW.statut;
      END IF;
    
    WHEN 'program_contributions' THEN
      request_type := 'program';
      recipient_email := NEW.email;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.statut IS DISTINCT FROM NEW.statut THEN
        notification_type := NEW.statut;
      END IF;
    
    WHEN 'restoration_requests' THEN
      request_type := 'restoration';
      SELECT email INTO recipient_email FROM profiles WHERE user_id = NEW.user_id;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
  END CASE;

  -- Ne rien faire si pas de changement significatif
  IF notification_type IS NULL OR recipient_email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Appeler la fonction edge via pg_net (asynchrone)
  PERFORM net.http_post(
    url := 'https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/send-workflow-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZmVwcG16bnVwenFrcW16anp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzMxNDYsImV4cCI6MjA3Mzk0OTE0Nn0._lNseTnhm88eUPMAMxeTZ-qn2vWGPm73M66lppaoSWE'
    ),
    body := jsonb_build_object(
      'request_type', request_type,
      'request_id', NEW.id::text,
      'notification_type', notification_type,
      'recipient_email', recipient_email
    )
  );

  RETURN NEW;
END;
$$;

-- Créer les triggers pour chaque table

-- Partnerships
DROP TRIGGER IF EXISTS partnership_notification_trigger ON partnerships;
CREATE TRIGGER partnership_notification_trigger
AFTER INSERT OR UPDATE ON partnerships
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Legal Deposit Requests
DROP TRIGGER IF EXISTS legal_deposit_notification_trigger ON legal_deposit_requests;
CREATE TRIGGER legal_deposit_notification_trigger
AFTER INSERT OR UPDATE ON legal_deposit_requests
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Reproduction Requests
DROP TRIGGER IF EXISTS reproduction_notification_trigger ON reproduction_requests;
CREATE TRIGGER reproduction_notification_trigger
AFTER INSERT OR UPDATE ON reproduction_requests
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Bookings (espaces culturels)
DROP TRIGGER IF EXISTS booking_notification_trigger ON bookings;
CREATE TRIGGER booking_notification_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Visits Bookings (visites guidées)
DROP TRIGGER IF EXISTS visit_notification_trigger ON visits_bookings;
CREATE TRIGGER visit_notification_trigger
AFTER INSERT OR UPDATE ON visits_bookings
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Program Contributions
DROP TRIGGER IF EXISTS program_notification_trigger ON program_contributions;
CREATE TRIGGER program_notification_trigger
AFTER INSERT OR UPDATE ON program_contributions
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Restoration Requests
DROP TRIGGER IF EXISTS restoration_notification_trigger ON restoration_requests;
CREATE TRIGGER restoration_notification_trigger
AFTER INSERT OR UPDATE ON restoration_requests
FOR EACH ROW
EXECUTE FUNCTION notify_workflow_change();

-- Activer l'extension pg_net si ce n'est pas déjà fait (pour les appels HTTP asynchrones)
CREATE EXTENSION IF NOT EXISTS pg_net;