-- Supprimer la politique problématique qui accède à auth.users
DROP POLICY IF EXISTS "Users can view invitations by email" ON professional_invitations;

-- Vérifier que seule la politique admin existe pour les invitations
-- Les admins peuvent tout voir et gérer
-- Les utilisateurs normaux n'ont pas besoin de voir la liste des invitations
-- (ils utilisent le token d'invitation direct pour s'inscrire)