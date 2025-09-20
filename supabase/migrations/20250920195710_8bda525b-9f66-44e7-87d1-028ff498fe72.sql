-- Amélioration de la sécurité pour la table activity_logs
-- Anonymisation des adresses IP et restriction des accès

-- Créer une fonction pour anonymiser les adresses IP
CREATE OR REPLACE FUNCTION public.anonymize_ip(ip_addr inet)
RETURNS inet
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymiser les adresses IPv4 (masquer le dernier octet)
  IF family(ip_addr) = 4 THEN
    RETURN set_masklen(network(set_masklen(ip_addr, 24)), 24);
  -- Anonymiser les adresses IPv6 (masquer les 64 derniers bits)
  ELSIF family(ip_addr) = 6 THEN
    RETURN set_masklen(network(set_masklen(ip_addr, 64)), 64);
  END IF;
  
  RETURN NULL;
END;
$$;

-- Créer une fonction pour anonymiser les user agents
CREATE OR REPLACE FUNCTION public.anonymize_user_agent(user_agent_str text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extraire seulement le navigateur principal et l'OS, masquer les détails spécifiques
  IF user_agent_str IS NULL OR LENGTH(user_agent_str) = 0 THEN
    RETURN 'Unknown';
  END IF;
  
  -- Simplifier le user agent pour préserver la confidentialité
  CASE 
    WHEN user_agent_str ILIKE '%Chrome%' THEN RETURN 'Chrome/Generic';
    WHEN user_agent_str ILIKE '%Firefox%' THEN RETURN 'Firefox/Generic';
    WHEN user_agent_str ILIKE '%Safari%' THEN RETURN 'Safari/Generic';
    WHEN user_agent_str ILIKE '%Edge%' THEN RETURN 'Edge/Generic';
    WHEN user_agent_str ILIKE '%Opera%' THEN RETURN 'Opera/Generic';
    ELSE RETURN 'Other/Generic';
  END CASE;
END;
$$;

-- Supprimer l'ancienne politique INSERT trop permissive
DROP POLICY IF EXISTS "System can insert logs" ON public.activity_logs;

-- Créer une nouvelle politique INSERT restrictive pour les systèmes autorisés
CREATE POLICY "Authorized systems can insert logs" 
ON public.activity_logs 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Seuls les utilisateurs authentifiés peuvent créer des logs
  auth.uid() IS NOT NULL AND
  -- L'utilisateur ne peut créer des logs que pour lui-même ou être admin
  (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()))
);

-- Améliorer la politique SELECT pour être plus granulaire
DROP POLICY IF EXISTS "Admins can view all logs" ON public.activity_logs;

-- Seuls les super admins peuvent voir tous les logs
CREATE POLICY "Super admins can view all logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Les bibliothécaires peuvent voir les logs liés à leur domaine
CREATE POLICY "Librarians can view content-related logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (
  get_user_role(auth.uid()) = 'librarian'::user_role AND
  resource_type IN ('content', 'manuscripts', 'collections')
);

-- Les utilisateurs peuvent voir leurs propres logs (limités)
CREATE POLICY "Users can view their own basic logs" 
ON public.activity_logs 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() AND
  resource_type IN ('profile', 'access_request') AND
  action NOT ILIKE '%sensitive%'
);

-- Créer une vue anonymisée pour les rapports
CREATE OR REPLACE VIEW public.activity_logs_anonymized AS
SELECT 
  id,
  user_id,
  action,
  resource_type,
  resource_id,
  -- Anonymiser les détails sensibles
  CASE 
    WHEN is_admin_or_librarian(auth.uid()) THEN details
    ELSE jsonb_build_object(
      'type', details->>'type',
      'timestamp', details->>'timestamp'
    )
  END as details,
  -- Anonymiser l'adresse IP
  anonymize_ip(ip_address) as ip_address_anonymized,
  -- Anonymiser le user agent
  anonymize_user_agent(user_agent) as user_agent_anonymized,
  created_at
FROM public.activity_logs;

-- Activer RLS sur la vue
ALTER VIEW public.activity_logs_anonymized SET (security_barrier = true);

-- Fonction pour nettoyer les anciens logs (rétention 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Supprimer les logs plus anciens que 90 jours
  DELETE FROM public.activity_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Fonction sécurisée pour insérer des logs
CREATE OR REPLACE FUNCTION public.insert_activity_log(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
  current_user_id uuid;
BEGIN
  -- Récupérer l'ID de l'utilisateur actuel
  current_user_id := auth.uid();
  
  -- Validation des données d'entrée
  IF p_action IS NULL OR LENGTH(TRIM(p_action)) = 0 THEN
    RAISE EXCEPTION 'Action cannot be empty';
  END IF;
  
  IF p_resource_type IS NULL OR LENGTH(TRIM(p_resource_type)) = 0 THEN
    RAISE EXCEPTION 'Resource type cannot be empty';
  END IF;
  
  -- Insérer le log avec anonymisation automatique
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    current_user_id,
    TRIM(p_action),
    TRIM(p_resource_type),
    p_resource_id,
    COALESCE(p_details, '{}'::jsonb),
    anonymize_ip(p_ip_address),
    anonymize_user_agent(p_user_agent),
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created 
ON public.activity_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_resource 
ON public.activity_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_cleanup 
ON public.activity_logs(created_at) 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Politique pour empêcher les modifications
CREATE POLICY "No updates allowed on activity logs" 
ON public.activity_logs 
FOR UPDATE 
TO authenticated
USING (false);

CREATE POLICY "No deletes except cleanup" 
ON public.activity_logs 
FOR DELETE 
TO authenticated
USING (
  -- Seuls les admins peuvent supprimer lors du nettoyage
  is_admin_or_librarian(auth.uid()) AND
  created_at < NOW() - INTERVAL '90 days'
);

COMMENT ON TABLE public.activity_logs IS 'Table des logs d''activité avec anonymisation automatique des données sensibles';
COMMENT ON FUNCTION public.anonymize_ip(inet) IS 'Anonymise les adresses IP en masquant les parties sensibles';
COMMENT ON FUNCTION public.anonymize_user_agent(text) IS 'Anonymise les user agents en gardant seulement les informations de base';
COMMENT ON FUNCTION public.insert_activity_log IS 'Fonction sécurisée pour insérer des logs avec anonymisation automatique';