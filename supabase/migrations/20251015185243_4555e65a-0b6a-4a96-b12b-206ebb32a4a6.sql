-- ============================================================================
-- Module Workflow BPM - BNRM (Correction v2)
-- ============================================================================

-- 1. TABLES DE BASE
CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  workflow_type TEXT NOT NULL,
  module TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  diagram_data JSONB,
  configuration JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_steps_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL,
  required_role TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  action_type TEXT,
  auto_actions JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '{}',
  deadline_hours INTEGER,
  notification_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, step_number)
);

CREATE TABLE IF NOT EXISTS workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  from_step_id UUID REFERENCES workflow_steps_new(id) ON DELETE CASCADE,
  to_step_id UUID REFERENCES workflow_steps_new(id) ON DELETE CASCADE,
  transition_name TEXT NOT NULL,
  condition_expression JSONB,
  trigger_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modifier workflow_instances
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'entity_type') THEN
    ALTER TABLE workflow_instances ADD COLUMN entity_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'entity_id') THEN
    ALTER TABLE workflow_instances ADD COLUMN entity_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'instance_number') THEN
    ALTER TABLE workflow_instances ADD COLUMN instance_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'workflow_id') THEN
    ALTER TABLE workflow_instances ADD COLUMN workflow_id UUID REFERENCES workflow_definitions(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'current_step_id') THEN
    ALTER TABLE workflow_instances ADD COLUMN current_step_id UUID REFERENCES workflow_steps_new(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'status') THEN
    ALTER TABLE workflow_instances ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'started_by') THEN
    ALTER TABLE workflow_instances ADD COLUMN started_by UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'started_at') THEN
    ALTER TABLE workflow_instances ADD COLUMN started_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'completed_at') THEN
    ALTER TABLE workflow_instances ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_instances' AND column_name = 'metadata') THEN
    ALTER TABLE workflow_instances ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_instances_number ON workflow_instances(instance_number) WHERE instance_number IS NOT NULL;

-- Modifier workflow_step_executions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'step_id') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN step_id UUID REFERENCES workflow_steps_new(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'assigned_to') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'action_taken') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN action_taken TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'comments') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN comments TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'started_at') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'completed_at') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'deadline_at') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN deadline_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_step_executions' AND column_name = 'metadata') THEN
    ALTER TABLE workflow_step_executions ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- 2. RÔLES ET PERMISSIONS
CREATE TABLE IF NOT EXISTS workflow_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  module TEXT NOT NULL,
  role_level TEXT DEFAULT 'module',
  description TEXT,
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_name, module)
);

CREATE TABLE IF NOT EXISTS workflow_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_role_id UUID REFERENCES workflow_roles(id) ON DELETE CASCADE,
  context_type TEXT,
  context_id UUID,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_user_roles_unique 
ON workflow_user_roles(user_id, workflow_role_id, context_type, COALESCE(context_id, '00000000-0000-0000-0000-000000000000'::UUID));

CREATE TABLE IF NOT EXISTS workflow_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_role_id UUID REFERENCES workflow_roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES workflow_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_role_id, permission_id)
);

-- 3. ÉVÉNEMENTS
CREATE TABLE IF NOT EXISTS workflow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_module TEXT,
  instance_id UUID REFERENCES workflow_instances(id),
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_name TEXT NOT NULL UNIQUE,
  source_module TEXT NOT NULL,
  target_module TEXT NOT NULL,
  event_types TEXT[] DEFAULT '{}',
  endpoint_url TEXT,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HISTORIQUE
CREATE TABLE IF NOT EXISTS workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
  from_step_id UUID REFERENCES workflow_steps_new(id),
  to_step_id UUID REFERENCES workflow_steps_new(id),
  performed_by UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  result TEXT,
  comments TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MÉTRIQUES
CREATE TABLE IF NOT EXISTS workflow_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflow_definitions(id),
  metric_date DATE DEFAULT CURRENT_DATE,
  total_instances INTEGER DEFAULT 0,
  completed_instances INTEGER DEFAULT 0,
  rejected_instances INTEGER DEFAULT 0,
  avg_completion_time_hours NUMERIC,
  avg_step_duration_hours NUMERIC,
  bottleneck_step_id UUID REFERENCES workflow_steps_new(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workflow_id, metric_date)
);

-- 6. FONCTIONS
CREATE OR REPLACE FUNCTION generate_workflow_instance_number(workflow_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  prefix TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  CASE workflow_type
    WHEN 'legal_deposit' THEN prefix := 'WF-DL';
    WHEN 'cataloging' THEN prefix := 'WF-CAT';
    WHEN 'cbm' THEN prefix := 'WF-CBM';
    WHEN 'ged' THEN prefix := 'WF-GED';
    WHEN 'payment' THEN prefix := 'WF-PAY';
    ELSE prefix := 'WF';
  END CASE;
  SELECT COALESCE(MAX(CAST(SPLIT_PART(instance_number, '-', 4) AS INTEGER)), 0) + 1
  INTO sequence_num FROM workflow_instances
  WHERE instance_number LIKE prefix || '-' || year_part || '-%';
  RETURN prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION has_workflow_permission(_user_id UUID, _permission_name TEXT, _workflow_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workflow_user_roles wur
    JOIN workflow_role_permissions wrp ON wur.workflow_role_id = wrp.workflow_role_id
    JOIN workflow_permissions wp ON wrp.permission_id = wp.id
    WHERE wur.user_id = _user_id AND wp.permission_name = _permission_name
      AND wur.is_active = true AND (wur.expires_at IS NULL OR wur.expires_at > NOW()) AND wrp.granted = true
  ) OR is_admin_or_librarian(_user_id);
END;
$$;

-- 7. INDEX
CREATE INDEX IF NOT EXISTS idx_workflow_instances_status ON workflow_instances(status);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_status ON workflow_step_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_step_executions_assigned ON workflow_step_executions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_events_status ON workflow_events(status);
CREATE INDEX IF NOT EXISTS idx_workflow_events_type ON workflow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_workflow_history_instance ON workflow_history(instance_id);

-- 8. RLS
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les définitions de workflow" ON workflow_definitions;
CREATE POLICY "Admins peuvent gérer les définitions de workflow" ON workflow_definitions FOR ALL USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir les workflows actifs" ON workflow_definitions;
CREATE POLICY "Utilisateurs peuvent voir les workflows actifs" ON workflow_definitions FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins peuvent gérer toutes les instances" ON workflow_instances;
CREATE POLICY "Admins peuvent gérer toutes les instances" ON workflow_instances FOR ALL USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs instances" ON workflow_instances;
CREATE POLICY "Utilisateurs peuvent voir leurs instances" ON workflow_instances FOR SELECT 
USING (started_by = auth.uid() OR has_workflow_permission(auth.uid(), 'view_instances'));

-- 9. DONNÉES INITIALES
INSERT INTO workflow_permissions (permission_name, category, description) VALUES
('create_workflow', 'workflow', 'Créer un nouveau workflow'),
('edit_workflow', 'workflow', 'Modifier un workflow existant'),
('delete_workflow', 'workflow', 'Supprimer un workflow'),
('activate_workflow', 'workflow', 'Activer/désactiver un workflow'),
('view_workflows', 'workflow', 'Voir les workflows'),
('start_instance', 'instance', 'Démarrer une instance de workflow'),
('view_instances', 'instance', 'Voir les instances de workflow'),
('assign_step', 'step', 'Assigner une étape à un utilisateur'),
('execute_step', 'step', 'Exécuter une étape de workflow'),
('manage_roles', 'admin', 'Gérer les rôles de workflow'),
('view_metrics', 'admin', 'Voir les métriques et rapports'),
('manage_integrations', 'admin', 'Gérer les intégrations inter-modules')
ON CONFLICT (permission_name) DO NOTHING;

INSERT INTO workflow_roles (role_name, module, role_level, description, permissions) VALUES
('workflow_admin', 'global', 'global', 'Administrateur de workflow', '["*"]'),
('workflow_manager', 'global', 'global', 'Gestionnaire de workflow', '["view_workflows", "view_instances", "view_metrics"]'),
('dl_validator', 'legal_deposit', 'module', 'Validateur Dépôt Légal', '["execute_step", "view_instances"]'),
('cbm_coordinator', 'cbm', 'module', 'Coordinateur CBM', '["execute_step", "view_instances", "assign_step"]'),
('ged_controller', 'ged', 'module', 'Contrôleur GED', '["execute_step", "view_instances"]'),
('payment_validator', 'payment', 'module', 'Validateur Paiement', '["execute_step", "view_instances"]')
ON CONFLICT (role_name, module) DO NOTHING;