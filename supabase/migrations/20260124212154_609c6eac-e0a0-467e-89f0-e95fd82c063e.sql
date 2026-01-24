-- Table pour stocker les logs de santé des services
CREATE TABLE public.service_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'platform',
  status TEXT NOT NULL DEFAULT 'healthy',
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes de monitoring
CREATE INDEX idx_service_health_service_name ON public.service_health_logs(service_name);
CREATE INDEX idx_service_health_checked_at ON public.service_health_logs(checked_at DESC);
CREATE INDEX idx_service_health_status ON public.service_health_logs(status);

-- Enable RLS
ALTER TABLE public.service_health_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion depuis les edge functions
CREATE POLICY "Allow service health inserts" 
ON public.service_health_logs 
FOR INSERT 
WITH CHECK (true);

-- Politique pour la lecture par les admins
CREATE POLICY "Admins can read service health logs" 
ON public.service_health_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Table pour la configuration des services à monitorer
CREATE TABLE public.monitored_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  service_type TEXT NOT NULL DEFAULT 'platform',
  endpoint_url TEXT,
  check_interval_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.monitored_services ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour les services monitorés
CREATE POLICY "Anyone can read monitored services" 
ON public.monitored_services 
FOR SELECT 
USING (true);

-- Modification par les admins uniquement
CREATE POLICY "Admins can manage monitored services" 
ON public.monitored_services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Insérer les services par défaut à monitorer
INSERT INTO public.monitored_services (service_name, service_type, endpoint_url, description, icon) VALUES
('Bibliothèque Numérique', 'platform', '/digital-library', 'Plateforme de consultation des documents numériques', 'BookOpen'),
('Manuscrits', 'platform', '/plateforme-manuscrits', 'Plateforme des manuscrits anciens', 'Scroll'),
('Kitab', 'platform', '/kitab', 'Catalogue national unifié', 'Library'),
('CBM', 'platform', '/cbm', 'Catalogue Bibliographique Marocain', 'Database'),
('Activités Culturelles', 'platform', '/cultural-activities', 'Plateforme des événements culturels', 'Calendar'),
('API Analytics', 'edge_function', '/functions/v1/analytics-service', 'Service de tracking et analytics', 'BarChart3'),
('API Chatbot', 'edge_function', '/functions/v1/bnrm-chatbot', 'Service de chatbot IA', 'Bot'),
('Supabase Auth', 'external_api', NULL, 'Service d''authentification', 'Shield'),
('Supabase Storage', 'external_api', NULL, 'Service de stockage de fichiers', 'HardDrive');

-- Vue pour les statistiques de santé récentes
CREATE OR REPLACE VIEW public.service_health_summary AS
SELECT 
  service_name,
  service_type,
  status,
  response_time_ms,
  checked_at,
  ROW_NUMBER() OVER (PARTITION BY service_name ORDER BY checked_at DESC) as rn
FROM public.service_health_logs
WHERE checked_at > now() - interval '24 hours';

-- Fonction pour nettoyer les anciens logs (garder 30 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_health_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.service_health_logs
  WHERE checked_at < now() - interval '30 days';
END;
$$;