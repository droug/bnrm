-- Créer une fonction sécurisée pour obtenir l'email de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_email()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$;

-- Supprimer l'ancienne politique SELECT
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs contributions" ON program_contributions;

-- Créer une nouvelle politique SELECT qui utilise la fonction sécurisée
CREATE POLICY "Utilisateurs peuvent voir leurs contributions"
ON program_contributions
FOR SELECT
TO authenticated
USING (email = get_user_email());