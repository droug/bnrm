-- Corriger la fonction advance_booking_workflow pour mettre à jour le statut correctement
CREATE OR REPLACE FUNCTION public.advance_booking_workflow(p_booking_id uuid, p_decision text, p_comment text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_booking RECORD;
  v_current_step RECORD;
  v_next_step RECORD;
  v_result JSONB;
  v_new_status TEXT;
BEGIN
  -- Récupérer la réservation
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Réservation non trouvée');
  END IF;
  
  -- Si c'est le début du workflow (current_step_code est NULL), initialiser avec la première étape
  IF v_booking.current_step_code IS NULL THEN
    SELECT * INTO v_current_step FROM booking_workflow_steps 
    WHERE step_order = 1;
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Première étape du workflow non trouvée');
    END IF;
    
    -- Initialiser le workflow
    UPDATE bookings 
    SET 
      current_step_code = v_current_step.step_code,
      current_step_order = v_current_step.step_order,
      workflow_started_at = NOW(),
      status = 'en_attente',
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    -- Enregistrer le démarrage dans l'historique
    INSERT INTO booking_workflow_history (
      booking_id, step_code, step_name, decision, comment, processed_by
    ) VALUES (
      p_booking_id, v_current_step.step_code, v_current_step.step_name, 
      'demarrage', 'Démarrage du workflow', auth.uid()
    );
    
    RETURN jsonb_build_object(
      'success', true,
      'workflow_completed', false,
      'current_step', v_current_step.step_name,
      'current_step_code', v_current_step.step_code,
      'message', 'Workflow démarré: ' || v_current_step.step_name
    );
  END IF;
  
  -- Récupérer l'étape actuelle
  SELECT * INTO v_current_step FROM booking_workflow_steps 
  WHERE step_code = v_booking.current_step_code;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Étape actuelle non trouvée');
  END IF;
  
  -- Enregistrer la décision dans l'historique
  INSERT INTO booking_workflow_history (
    booking_id, step_code, step_name, decision, comment, processed_by
  ) VALUES (
    p_booking_id, v_current_step.step_code, v_current_step.step_name, 
    p_decision, p_comment, auth.uid()
  );
  
  -- Déterminer le nouveau statut en fonction de la décision
  v_new_status := CASE 
    WHEN p_decision = 'validee' THEN 'validee'
    WHEN p_decision = 'refusee' THEN 'rejetee'
    WHEN p_decision = 'verification_en_cours' THEN 'verification_en_cours'
    WHEN p_decision = 'confirmee' THEN 'confirmee'
    WHEN p_decision = 'en_contrat' THEN 'en_contrat'
    WHEN p_decision = 'facturee' THEN 'facturee'
    WHEN p_decision = 'degats_constates' THEN 'en_attente'
    WHEN p_decision = 'cloturee' THEN 'cloturee'
    WHEN p_decision = 'archivee_sans_suite' THEN 'archivee_sans_suite'
    ELSE 'en_attente'
  END;
  
  -- Déterminer l'étape suivante
  SELECT * INTO v_next_step FROM booking_workflow_steps 
  WHERE step_order = v_current_step.step_order + 1;
  
  -- Si c'est la dernière étape, finaliser le workflow
  IF v_next_step IS NULL THEN
    UPDATE bookings 
    SET 
      status = v_new_status,
      workflow_completed_at = NOW(),
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    v_result := jsonb_build_object(
      'success', true,
      'workflow_completed', true,
      'final_status', v_new_status,
      'message', 'Workflow terminé'
    );
  ELSE
    -- Passer à l'étape suivante
    UPDATE bookings 
    SET 
      current_step_code = v_next_step.step_code,
      current_step_order = v_next_step.step_order,
      status = v_new_status,
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    v_result := jsonb_build_object(
      'success', true,
      'workflow_completed', false,
      'next_step', v_next_step.step_name,
      'next_step_code', v_next_step.step_code,
      'message', 'Passé à l''étape suivante: ' || v_next_step.step_name
    );
  END IF;
  
  RETURN v_result;
END;
$function$;