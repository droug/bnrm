-- Ajouter un champ pour indiquer si un service est gratuit
ALTER TABLE public.bnrm_services
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS usage_limit_per_year INTEGER;

-- Mettre à jour le Pass journalier pour être gratuit avec limite d'1 fois par an
UPDATE public.bnrm_services
SET 
  is_free = true,
  usage_limit_per_year = 1
WHERE id_service = 'SRV-PASS-JOUR';

-- Mettre les tarifs du Pass journalier à 0 MAD (gratuit)
UPDATE public.bnrm_tarifs
SET montant = 0
WHERE id_service = 'SRV-PASS-JOUR';

-- Créer une table pour tracker les utilisations du Pass journalier
CREATE TABLE IF NOT EXISTS public.daily_pass_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES public.bnrm_services(id_service),
  usage_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  usage_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_id, usage_year)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_daily_pass_usage_user_year 
ON public.daily_pass_usage(user_id, usage_year);

-- Activer RLS sur la table
ALTER TABLE public.daily_pass_usage ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres utilisations
CREATE POLICY "Users can view their own pass usage"
ON public.daily_pass_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent enregistrer leur utilisation
CREATE POLICY "Users can record their pass usage"
ON public.daily_pass_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Les admins peuvent tout voir
CREATE POLICY "Admins can view all pass usage"
ON public.daily_pass_usage
FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Fonction pour vérifier si un utilisateur peut utiliser le pass cette année
CREATE OR REPLACE FUNCTION public.can_use_daily_pass(
  p_user_id UUID,
  p_service_id TEXT DEFAULT 'SRV-PASS-JOUR'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year INTEGER;
  usage_count INTEGER;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());
  
  SELECT COUNT(*) INTO usage_count
  FROM public.daily_pass_usage
  WHERE user_id = p_user_id
    AND service_id = p_service_id
    AND usage_year = current_year;
  
  RETURN usage_count = 0;
END;
$$;

-- Fonction pour enregistrer l'utilisation du pass
CREATE OR REPLACE FUNCTION public.record_daily_pass_usage(
  p_user_id UUID,
  p_service_id TEXT DEFAULT 'SRV-PASS-JOUR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_can_use BOOLEAN;
  v_usage_id UUID;
BEGIN
  -- Vérifier si l'utilisateur peut utiliser le pass
  v_can_use := public.can_use_daily_pass(p_user_id, p_service_id);
  
  IF NOT v_can_use THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Vous avez déjà utilisé votre pass journalier gratuit cette année'
    );
  END IF;
  
  -- Enregistrer l'utilisation
  INSERT INTO public.daily_pass_usage (user_id, service_id, usage_year)
  VALUES (p_user_id, p_service_id, EXTRACT(YEAR FROM NOW()))
  RETURNING id INTO v_usage_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'usage_id', v_usage_id,
    'message', 'Pass journalier activé avec succès'
  );
END;
$$;