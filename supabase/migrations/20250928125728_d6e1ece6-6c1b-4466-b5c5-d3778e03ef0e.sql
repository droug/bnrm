-- Fix search_path issues for functions that don't have it set properly
-- This addresses the security warning about mutable search paths

-- Fix the get_admin_profile_summary function to have proper search_path
CREATE OR REPLACE FUNCTION public.get_admin_profile_summary(user_uuid uuid)
RETURNS TABLE (
  user_id uuid,
  role user_role,
  is_approved boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  first_name text,
  last_name text,
  institution text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.role,
    p.is_approved,
    p.created_at,
    p.updated_at,
    p.first_name,
    p.last_name,
    p.institution
  FROM public.profiles p
  WHERE p.user_id = user_uuid
  AND public.is_admin_or_librarian(auth.uid());
$$;

-- Fix any other functions that might have search_path issues
-- Update historiser_tarifs function to have proper search_path
CREATE OR REPLACE FUNCTION public.historiser_tarifs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (OLD.id_tarif, OLD.montant, NEW.montant, auth.uid(), 'UPDATE', 
     'Modification du tarif de ' || OLD.montant || ' à ' || NEW.montant || ' ' || NEW.devise);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (OLD.id_tarif, OLD.montant, NULL, auth.uid(), 'DELETE', 'Suppression du tarif');
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.bnrm_tarifs_historique 
    (id_tarif, ancienne_valeur, nouvelle_valeur, utilisateur_responsable, action, commentaire)
    VALUES 
    (NEW.id_tarif, NULL, NEW.montant, auth.uid(), 'CREATE', 'Création du tarif');
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;