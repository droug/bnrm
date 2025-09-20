-- Corriger les politiques RLS pour permettre aux admins de modifier les rôles des autres utilisateurs

-- Supprimer l'ancienne politique UPDATE restrictive
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;

-- Créer une nouvelle politique UPDATE pour les utilisateurs normaux
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Empêcher les utilisateurs normaux de changer leur propre rôle
  (OLD.role = NEW.role OR is_admin_or_librarian(auth.uid()))
);

-- Créer une politique UPDATE spéciale pour les administrateurs
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

-- Vérifier les politiques créées
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public' AND cmd = 'UPDATE'
ORDER BY policyname;