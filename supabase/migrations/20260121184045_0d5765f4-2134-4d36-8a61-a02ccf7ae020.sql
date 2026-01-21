-- Corriger le trigger check_deposit_confirmations qui utilise 'submitted' au lieu de 'soumis'
CREATE OR REPLACE FUNCTION public.check_deposit_confirmations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_editor_confirmed BOOLEAN;
  v_printer_confirmed BOOLEAN;
BEGIN
  SELECT 
    COALESCE(bool_or(status = 'confirmed' AND party_type = 'editor'), FALSE),
    COALESCE(bool_or(status = 'confirmed' AND party_type = 'printer'), FALSE)
  INTO v_editor_confirmed, v_printer_confirmed
  FROM public.deposit_confirmation_tokens
  WHERE request_id = NEW.request_id;
  
  IF v_editor_confirmed AND v_printer_confirmed THEN
    UPDATE public.legal_deposit_requests
    SET 
      editor_confirmed = TRUE,
      printer_confirmed = TRUE,
      confirmation_status = 'confirmed',
      status = 'soumis',  -- Correction: 'submitted' -> 'soumis' pour correspondre à l'enum deposit_status
      updated_at = now()
    WHERE id = NEW.request_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.legal_deposit_requests
    SET 
      confirmation_status = 'rejected',
      updated_at = now()
    WHERE id = NEW.request_id;
  END IF;
  
  RETURN NEW;
END;
$$;