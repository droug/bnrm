-- Supprimer la vue qui expose auth.users (problème de sécurité)
DROP VIEW IF EXISTS public.admin_users_view;

-- Créer une fonction sécurisée pour récupérer les utilisateurs avec email (admin only)
CREATE OR REPLACE FUNCTION public.get_admin_users_with_email()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  phone text,
  institution text,
  research_field text,
  is_approved boolean,
  created_at timestamptz,
  updated_at timestamptz,
  subscription_type text,
  partner_organization text,
  research_specialization text[],
  access_level_details jsonb,
  profile_preferences jsonb,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'utilisateur est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.phone,
    p.institution,
    p.research_field,
    p.is_approved,
    p.created_at,
    p.updated_at,
    p.subscription_type,
    p.partner_organization,
    p.research_specialization,
    p.access_level_details,
    p.profile_preferences,
    u.email
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.user_id = u.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Supprimer l'ancienne fonction is_admin si elle existe
DROP FUNCTION IF EXISTS public.is_admin();