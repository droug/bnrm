-- Nettoyer les utilisateurs professionnels sans profil
DELETE FROM user_roles 
WHERE role IN ('editor', 'printer', 'distributor', 'producer', 'author')
AND user_id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL);

-- Vérifier le trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    is_approved,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''), 'Utilisateur'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''), ''),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    updated_at = NOW();
  
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