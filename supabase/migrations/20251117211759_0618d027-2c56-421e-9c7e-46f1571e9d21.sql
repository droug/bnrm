-- Fonction pour envoyer les webhooks automatiquement
CREATE OR REPLACE FUNCTION notify_cms_webhook()
RETURNS TRIGGER AS $$
DECLARE
  event_type TEXT;
  entity_type TEXT;
BEGIN
  -- Déterminer le type d'événement
  IF TG_OP = 'INSERT' THEN
    event_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si status change vers 'published', c'est une publication
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
      event_type := 'published';
    ELSE
      event_type := 'updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    event_type := 'deleted';
  END IF;

  -- Déterminer le type d'entité
  entity_type := TG_TABLE_NAME;

  -- Déclencher l'appel webhook via l'edge function
  -- Note: pg_net doit être activé pour cela
  -- Alternative: utiliser un worker externe ou des triggers Supabase
  
  -- Pour l'instant, on logue juste l'événement
  -- L'appel réel sera fait via l'application ou un trigger Supabase
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour cms_pages
DROP TRIGGER IF EXISTS cms_pages_webhook_trigger ON cms_pages;
CREATE TRIGGER cms_pages_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cms_pages
  FOR EACH ROW
  EXECUTE FUNCTION notify_cms_webhook();

-- Triggers pour cms_actualites
DROP TRIGGER IF EXISTS cms_actualites_webhook_trigger ON cms_actualites;
CREATE TRIGGER cms_actualites_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cms_actualites
  FOR EACH ROW
  EXECUTE FUNCTION notify_cms_webhook();

-- Triggers pour cms_evenements
DROP TRIGGER IF EXISTS cms_evenements_webhook_trigger ON cms_evenements;
CREATE TRIGGER cms_evenements_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON cms_evenements
  FOR EACH ROW
  EXECUTE FUNCTION notify_cms_webhook();

-- Fonction pour appeler manuellement un webhook (pour tests)
CREATE OR REPLACE FUNCTION trigger_cms_webhook(
  p_event_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Cette fonction sera utilisée par l'application pour déclencher les webhooks
  -- Elle retourne simplement les paramètres pour l'instant
  result := jsonb_build_object(
    'event_type', p_event_type,
    'entity_type', p_entity_type,
    'entity_id', p_entity_id,
    'data', p_data,
    'timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction helper pour incrémenter les compteurs
CREATE OR REPLACE FUNCTION increment_webhook_counter(
  p_webhook_id UUID,
  p_success BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_success THEN
    UPDATE cms_webhooks 
    SET 
      success_count = success_count + 1,
      last_triggered_at = NOW()
    WHERE id = p_webhook_id;
  ELSE
    UPDATE cms_webhooks 
    SET 
      failure_count = failure_count + 1,
      last_triggered_at = NOW()
    WHERE id = p_webhook_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;