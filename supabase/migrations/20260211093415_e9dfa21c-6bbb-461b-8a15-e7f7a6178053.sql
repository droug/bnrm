-- Update notify_workflow_change to also send notifications to the author for legal_deposit_requests
CREATE OR REPLACE FUNCTION public.notify_workflow_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, auth
AS $$
DECLARE
  notification_type TEXT;
  recipient_email TEXT;
  request_type TEXT;
  author_email TEXT;
BEGIN
  -- Déterminer le type de notification et l'email du destinataire selon la table
  CASE TG_TABLE_NAME
    WHEN 'partnerships' THEN
      request_type := 'partnership';
      recipient_email := NEW.email_officiel;
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'legal_deposit_requests' THEN
      request_type := 'legal_deposit';
      -- Get email from professional registry via initiator_id
      SELECT pr.email INTO recipient_email 
      FROM professional_registry pr
      WHERE pr.id = NEW.initiator_id;
      
      -- Get author email from metadata
      author_email := NEW.metadata->'customFields'->>'author_email';
      
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
    
    WHEN 'reproduction_requests' THEN
      request_type := 'reproduction';
      SELECT email INTO recipient_email 
      FROM auth.users 
      WHERE id = NEW.user_id;
      
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
      SELECT email INTO recipient_email 
      FROM auth.users 
      WHERE id = NEW.user_id;
      
      IF TG_OP = 'INSERT' THEN
        notification_type := 'created';
      ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
        notification_type := NEW.status;
      END IF;
  END CASE;

  -- Ne rien faire si pas de changement significatif
  IF notification_type IS NULL OR recipient_email IS NULL THEN
    -- Even if main recipient is null, try to notify author if available
    IF notification_type IS NOT NULL AND author_email IS NOT NULL AND author_email <> '' THEN
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
          'recipient_email', author_email
        )
      );
    END IF;
    
    IF recipient_email IS NULL THEN
      RETURN NEW;
    END IF;
    
    IF notification_type IS NULL THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Appeler la fonction edge via pg_net (asynchrone) pour le destinataire principal
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

  -- Envoyer aussi à l'auteur si disponible et différent du destinataire principal
  IF author_email IS NOT NULL AND author_email <> '' AND author_email <> recipient_email THEN
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
        'recipient_email', author_email
      )
    );
  END IF;

  RETURN NEW;
END;
$$;