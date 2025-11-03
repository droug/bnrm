-- Corriger la fonction trigger qui cause l'erreur
DROP TRIGGER IF EXISTS track_restoration_status_changes ON public.restoration_requests;

CREATE OR REPLACE FUNCTION public.track_restoration_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    
    -- Les notifications sont gérées par le frontend et les edge functions
    -- Ne pas appeler net.http_post ici
  END IF;
  RETURN NEW;
END;
$$;

-- Recréer le trigger
CREATE TRIGGER track_restoration_status_changes
  AFTER UPDATE ON public.restoration_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.track_restoration_status_change();