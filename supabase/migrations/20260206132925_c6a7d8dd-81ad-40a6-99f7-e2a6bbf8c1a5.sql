-- Corriger la fonction is_validator pour qu'elle ne dépende pas de profiles.is_approved
-- Les validateurs sont directement assignés via user_roles et n'ont pas besoin d'approbation de profil

CREATE OR REPLACE FUNCTION public.is_validator(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
      AND ur.role = 'validateur'
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;