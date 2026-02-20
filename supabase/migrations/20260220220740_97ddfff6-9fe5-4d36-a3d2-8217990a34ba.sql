
-- Ajouter les colonnes de gestion de durée d'abonnement
ALTER TABLE public.service_registrations
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS renewal_reminder_sent BOOLEAN DEFAULT FALSE;

-- Index pour les requêtes de vérification d'expiration
CREATE INDEX IF NOT EXISTS idx_service_registrations_expires_at
  ON public.service_registrations(expires_at)
  WHERE status = 'active';

-- Fonction pour calculer la date d'expiration selon la formule du tarif
CREATE OR REPLACE FUNCTION public.calculate_subscription_expiry(
  p_tariff_condition TEXT,
  p_activated_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lower TEXT;
BEGIN
  v_lower := LOWER(COALESCE(p_tariff_condition, ''));

  -- Semestrielle : 6 mois
  IF v_lower LIKE '%semestriel%' OR v_lower LIKE '%6 mois%' OR v_lower LIKE '%semestre%' THEN
    RETURN p_activated_at + INTERVAL '6 months';
  END IF;

  -- Annuelle : 12 mois
  IF v_lower LIKE '%annuel%' OR v_lower LIKE '%12 mois%' OR v_lower LIKE '%annee%' OR v_lower LIKE '%année%' THEN
    RETURN p_activated_at + INTERVAL '12 months';
  END IF;

  -- Trimestrielle : 3 mois
  IF v_lower LIKE '%trimestriel%' OR v_lower LIKE '%3 mois%' THEN
    RETURN p_activated_at + INTERVAL '3 months';
  END IF;

  -- Mensuelle : 1 mois
  IF v_lower LIKE '%mensuel%' OR v_lower LIKE '%1 mois%' THEN
    RETURN p_activated_at + INTERVAL '1 month';
  END IF;

  -- Par défaut : annuelle (12 mois) si aucun match
  RETURN p_activated_at + INTERVAL '12 months';
END;
$$;

-- Fonction pour expirer automatiquement les abonnements dépassés
-- et marquer ceux qui approchent de la fin (J-7)
CREATE OR REPLACE FUNCTION public.process_subscription_expirations()
RETURNS TABLE(
  processed_expired INT,
  processed_reminders INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired INT := 0;
  v_reminders INT := 0;
BEGIN
  -- 1. Expirer les abonnements dépassés
  UPDATE public.service_registrations
  SET
    status = 'expired',
    updated_at = NOW()
  WHERE
    status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  GET DIAGNOSTICS v_expired = ROW_COUNT;

  -- 2. Marquer pour rappel J-7 (sans encore envoyer l'email — l'edge function s'en charge)
  UPDATE public.service_registrations
  SET renewal_reminder_sent = FALSE
  WHERE
    status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    AND renewal_reminder_sent IS NULL;

  GET DIAGNOSTICS v_reminders = ROW_COUNT;

  RETURN QUERY SELECT v_expired, v_reminders;
END;
$$;

-- Activer pg_cron si pas encore activé
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
