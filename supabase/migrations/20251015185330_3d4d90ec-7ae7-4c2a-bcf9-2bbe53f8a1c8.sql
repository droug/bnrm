-- Corriger les problèmes de sécurité RLS

-- Activer RLS et créer les politiques pour les tables manquantes

-- workflow_roles
ALTER TABLE workflow_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les rôles de workflow" ON workflow_roles;
CREATE POLICY "Admins peuvent gérer les rôles de workflow"
ON workflow_roles FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir les rôles" ON workflow_roles;
CREATE POLICY "Utilisateurs peuvent voir les rôles"
ON workflow_roles FOR SELECT
USING (true);

-- workflow_user_roles
ALTER TABLE workflow_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les affectations de rôles" ON workflow_user_roles;
CREATE POLICY "Admins peuvent gérer les affectations de rôles"
ON workflow_user_roles FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs rôles" ON workflow_user_roles;
CREATE POLICY "Utilisateurs peuvent voir leurs rôles"
ON workflow_user_roles FOR SELECT
USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- workflow_permissions
ALTER TABLE workflow_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les permissions" ON workflow_permissions;
CREATE POLICY "Admins peuvent gérer les permissions"
ON workflow_permissions FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Tout le monde peut voir les permissions" ON workflow_permissions;
CREATE POLICY "Tout le monde peut voir les permissions"
ON workflow_permissions FOR SELECT
USING (true);

-- workflow_role_permissions
ALTER TABLE workflow_role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les liaisons rôle-permission" ON workflow_role_permissions;
CREATE POLICY "Admins peuvent gérer les liaisons rôle-permission"
ON workflow_role_permissions FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir les liaisons rôle-permission" ON workflow_role_permissions;
CREATE POLICY "Utilisateurs peuvent voir les liaisons rôle-permission"
ON workflow_role_permissions FOR SELECT
USING (true);

-- workflow_transitions
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les transitions" ON workflow_transitions;
CREATE POLICY "Admins peuvent gérer les transitions"
ON workflow_transitions FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir les transitions" ON workflow_transitions;
CREATE POLICY "Utilisateurs peuvent voir les transitions"
ON workflow_transitions FOR SELECT
USING (true);

-- workflow_events
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les événements" ON workflow_events;
CREATE POLICY "Admins peuvent gérer les événements"
ON workflow_events FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Système peut insérer des événements" ON workflow_events;
CREATE POLICY "Système peut insérer des événements"
ON workflow_events FOR INSERT
WITH CHECK (true);

-- workflow_integrations
ALTER TABLE workflow_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les intégrations" ON workflow_integrations;
CREATE POLICY "Admins peuvent gérer les intégrations"
ON workflow_integrations FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir les intégrations actives" ON workflow_integrations;
CREATE POLICY "Utilisateurs peuvent voir les intégrations actives"
ON workflow_integrations FOR SELECT
USING (is_active = true);

-- workflow_history
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent voir tout l'historique" ON workflow_history;
CREATE POLICY "Admins peuvent voir tout l'historique"
ON workflow_history FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs peuvent voir l'historique de leurs instances" ON workflow_history;
CREATE POLICY "Utilisateurs peuvent voir l'historique de leurs instances"
ON workflow_history FOR SELECT
USING (EXISTS (
  SELECT 1 FROM workflow_instances wi
  WHERE wi.id = workflow_history.instance_id
  AND wi.started_by = auth.uid()
));

DROP POLICY IF EXISTS "Système peut insérer dans l'historique" ON workflow_history;
CREATE POLICY "Système peut insérer dans l'historique"
ON workflow_history FOR INSERT
WITH CHECK (true);

-- workflow_notifications
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs notifications" ON workflow_notifications;
CREATE POLICY "Utilisateurs peuvent voir leurs notifications"
ON workflow_notifications FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Utilisateurs peuvent marquer leurs notifications comme lues" ON workflow_notifications;
CREATE POLICY "Utilisateurs peuvent marquer leurs notifications comme lues"
ON workflow_notifications FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Système peut créer des notifications" ON workflow_notifications;
CREATE POLICY "Système peut créer des notifications"
ON workflow_notifications FOR INSERT
WITH CHECK (true);

-- workflow_metrics
ALTER TABLE workflow_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins peuvent gérer les métriques" ON workflow_metrics;
CREATE POLICY "Admins peuvent gérer les métriques"
ON workflow_metrics FOR ALL
USING (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Utilisateurs avec permission peuvent voir les métriques" ON workflow_metrics;
CREATE POLICY "Utilisateurs avec permission peuvent voir les métriques"
ON workflow_metrics FOR SELECT
USING (has_workflow_permission(auth.uid(), 'view_metrics'));