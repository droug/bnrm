-- Corriger les politiques RLS pour permettre aux admins de modifier les rôles des autres utilisateurs
-- Approche simplifiée sans références OLD/NEW

-- Supprimer l'ancienne politique UPDATE restrictive
DROP POLICY IF EXISTS "Authenticated users can update their own profile" ON public.profiles;

-- Créer une politique UPDATE pour les utilisateurs normaux (sans modification de rôle)
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

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