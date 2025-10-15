-- Enable RLS on workflow_steps_new if not already enabled
ALTER TABLE workflow_steps_new ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage workflow steps
CREATE POLICY "Admins peuvent gérer les étapes de workflow"
ON workflow_steps_new
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

-- Policy for users to view workflow steps
CREATE POLICY "Utilisateurs peuvent voir les étapes de workflow"
ON workflow_steps_new
FOR SELECT
TO authenticated
USING (true);