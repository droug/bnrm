-- Amélioration de la sécurité pour la table profiles
-- Ajout d'une politique restrictive pour la création de profils

-- D'abord, supprimer l'ancienne politique INSERT trop permissive
DROP POLICY IF EXISTS "Anyone can create a profile" ON public.profiles;

-- Créer une nouvelle politique INSERT plus restrictive
CREATE POLICY "Authenticated users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Améliorer la politique UPDATE pour être plus stricte
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Améliorer la politique SELECT pour être plus stricte
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Garder la politique admin inchangée car elle est nécessaire pour l'administration
-- "Admins and librarians can view all profiles" reste active

-- Ajouter une politique pour empêcher la suppression non autorisée
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

-- Créer un index pour améliorer les performances des requêtes RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Améliorer la fonction handle_new_user pour plus de sécurité
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Validation des données d'entrée
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Insertion sécurisée avec validation
  INSERT INTO public.profiles (
    user_id, 
    first_name, 
    last_name, 
    role,
    is_approved,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''), 'Utilisateur'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''), ''),
    'visitor',
    false,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Si le profil existe déjà, ne pas échouer
    RETURN NEW;
  WHEN OTHERS THEN
    -- Logger l'erreur mais ne pas bloquer l'inscription
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;