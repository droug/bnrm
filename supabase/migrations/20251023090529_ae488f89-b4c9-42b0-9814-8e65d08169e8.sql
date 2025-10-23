-- Ajouter les rôles spécifiques pour les activités culturelles
INSERT INTO workflow_roles (role_name, module, role_level, description) VALUES
('Bureau d''ordre', 'cultural_activities', 1, 'Responsable de la réception et du transfert des demandes'),
('Direction', 'cultural_activities', 2, 'Responsable de la validation initiale des demandes'),
('DAC', 'cultural_activities', 3, 'Direction des Activités Culturelles - traitement et clôture'),
('Service Comptabilité', 'cultural_activities', 4, 'Responsable de la facturation'),
('Service Bâtiment', 'cultural_activities', 5, 'Responsable de la mise à disposition et état des lieux')
ON CONFLICT (role_name, module) DO NOTHING;

-- Créer le workflow pour les activités culturelles
INSERT INTO workflow_definitions (
  name,
  description,
  workflow_type,
  module,
  version,
  is_active
) VALUES (
  'Workflow Activités Culturelles',
  'Circuit de validation complet pour les demandes d''activités culturelles (réservations, visites, partenariats, programmation)',
  'cultural_activities',
  'cultural_activities',
  1,
  true
) ON CONFLICT DO NOTHING;

-- Récupérer l'ID du workflow créé et créer les étapes
DO $$
DECLARE
  v_workflow_id uuid;
BEGIN
  SELECT id INTO v_workflow_id 
  FROM workflow_definitions 
  WHERE workflow_type = 'cultural_activities' 
  LIMIT 1;

  -- Créer les étapes du workflow
  INSERT INTO workflow_steps_new (
    workflow_id,
    step_number,
    step_name,
    step_type,
    required_role,
    action_type,
    deadline_hours,
    notification_config
  ) VALUES
  (v_workflow_id, 1, 'Réception', 'validation', 'Bureau d''ordre', 'transfer', 24, '{"notify_on_arrival": true, "notify_role": "Bureau d''ordre"}'::jsonb),
  (v_workflow_id, 2, 'Validation initiale', 'validation', 'Direction', 'approve_reject', 48, '{"notify_on_arrival": true, "notify_role": "Direction"}'::jsonb),
  (v_workflow_id, 3, 'Traitement', 'processing', 'DAC', 'process', 72, '{"notify_on_arrival": true, "notify_role": "DAC"}'::jsonb),
  (v_workflow_id, 4, 'Facturation', 'processing', 'Service Comptabilité', 'invoice', 48, '{"notify_on_arrival": true, "notify_role": "Service Comptabilité"}'::jsonb),
  (v_workflow_id, 5, 'Mise à disposition', 'processing', 'Service Bâtiment', 'handover', 24, '{"notify_on_arrival": true, "notify_role": "Service Bâtiment"}'::jsonb),
  (v_workflow_id, 6, 'Clôture', 'completion', 'DAC', 'archive', 48, '{"notify_on_arrival": true, "notify_role": "DAC"}'::jsonb)
  ON CONFLICT DO NOTHING;

  -- Créer les transitions entre les étapes
  INSERT INTO workflow_transitions (
    workflow_id,
    from_step_id,
    to_step_id,
    transition_name,
    trigger_type,
    condition_expression
  )
  SELECT 
    v_workflow_id,
    s1.id,
    s2.id,
    'Vers ' || s2.step_name,
    'manual',
    '{"requires_approval": true}'::jsonb
  FROM workflow_steps_new s1
  CROSS JOIN workflow_steps_new s2
  WHERE s1.workflow_id = v_workflow_id
    AND s2.workflow_id = v_workflow_id
    AND s2.step_number = s1.step_number + 1
  ON CONFLICT DO NOTHING;
END $$;