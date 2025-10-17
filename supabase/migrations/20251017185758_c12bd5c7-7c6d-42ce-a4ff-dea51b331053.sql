-- Supprimer l'ancienne politique problématique
DROP POLICY IF EXISTS "Users can view their own invitation" ON professional_invitations;

-- Créer une nouvelle politique simplifiée pour les utilisateurs
-- Les utilisateurs peuvent voir uniquement les invitations qui correspondent à leur email
CREATE POLICY "Users can view invitations by email"
ON professional_invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);