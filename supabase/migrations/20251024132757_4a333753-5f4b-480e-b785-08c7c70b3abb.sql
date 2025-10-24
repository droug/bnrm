-- Créer une table pour les étapes du workflow
CREATE TABLE IF NOT EXISTS booking_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_order INTEGER NOT NULL UNIQUE,
  step_name TEXT NOT NULL,
  step_code TEXT NOT NULL UNIQUE,
  description TEXT,
  assigned_role TEXT, -- Rôle responsable de cette étape
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les étapes du workflow
INSERT INTO booking_workflow_steps (step_order, step_name, step_code, assigned_role, description) VALUES
  (1, 'Réception et enregistrement', 'reception', 'Bureau d''ordre', 'Réception initiale de la demande'),
  (2, 'Vérification des disponibilités', 'verification_disponibilite', 'DAC', 'Vérification de la disponibilité de l''espace'),
  (3, 'Examen préliminaire', 'examen_preliminaire', 'DAC', 'Examen préliminaire par la DAC'),
  (4, 'Validation directionnelle', 'validation_direction', 'Direction', 'Validation finale par la direction');

-- Créer une table pour l'historique des transitions
CREATE TABLE IF NOT EXISTS booking_workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  step_code TEXT NOT NULL,
  step_name TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('validee', 'refusee', 'verification_en_cours')),
  comment TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter des colonnes à la table bookings pour gérer le workflow
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS current_step_code TEXT DEFAULT 'reception',
ADD COLUMN IF NOT EXISTS current_step_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS workflow_started_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS workflow_completed_at TIMESTAMPTZ;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_bookings_current_step ON bookings(current_step_code);
CREATE INDEX IF NOT EXISTS idx_workflow_history_booking ON booking_workflow_history(booking_id);

-- Fonction pour faire avancer le workflow
CREATE OR REPLACE FUNCTION advance_booking_workflow(
  p_booking_id UUID,
  p_decision TEXT,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_booking RECORD;
  v_current_step RECORD;
  v_next_step RECORD;
  v_result JSONB;
BEGIN
  -- Récupérer la réservation
  SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Réservation non trouvée');
  END IF;
  
  -- Récupérer l'étape actuelle
  SELECT * INTO v_current_step FROM booking_workflow_steps 
  WHERE step_code = v_booking.current_step_code;
  
  -- Enregistrer la décision dans l'historique
  INSERT INTO booking_workflow_history (
    booking_id, step_code, step_name, decision, comment, processed_by
  ) VALUES (
    p_booking_id, v_current_step.step_code, v_current_step.step_name, 
    p_decision, p_comment, auth.uid()
  );
  
  -- Déterminer l'étape suivante
  SELECT * INTO v_next_step FROM booking_workflow_steps 
  WHERE step_order = v_current_step.step_order + 1;
  
  -- Si c'est la dernière étape, finaliser le workflow
  IF v_next_step IS NULL THEN
    UPDATE bookings 
    SET 
      status = CASE 
        WHEN p_decision = 'validee' THEN 'validee'
        WHEN p_decision = 'refusee' THEN 'rejetee'
        ELSE 'verification_en_cours'
      END,
      workflow_completed_at = NOW(),
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = p_booking_id;
    
    v_result := jsonb_build_object(
      'success', true,
      'workflow_completed', true,
      'final_status', p_decision,
      'message', 'Workflow terminé'
    );
  ELSE
    -- Passer à l'étape suivante
    UPDATE bookings 
    SET 
      current_step_code = v_next_step.step_code,
      current_step_order = v_next_step.step_order,
      status = 'en_attente',
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
$$;

-- Fonction pour obtenir l'historique du workflow d'une réservation
CREATE OR REPLACE FUNCTION get_booking_workflow_history(p_booking_id UUID)
RETURNS TABLE (
  step_name TEXT,
  decision TEXT,
  comment TEXT,
  processed_by_email TEXT,
  processed_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    bwh.step_name,
    bwh.decision,
    bwh.comment,
    au.email as processed_by_email,
    bwh.processed_at
  FROM booking_workflow_history bwh
  LEFT JOIN auth.users au ON bwh.processed_by = au.id
  WHERE bwh.booking_id = p_booking_id
  ORDER BY bwh.processed_at ASC;
$$;

-- RLS policies
ALTER TABLE booking_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workflow_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tous peuvent voir les étapes du workflow"
ON booking_workflow_steps FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins peuvent voir l'historique"
ON booking_workflow_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

CREATE POLICY "Admins peuvent insérer dans l'historique"
ON booking_workflow_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);