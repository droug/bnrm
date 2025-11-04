-- Table pour les configurations d'intégration externe
CREATE TABLE IF NOT EXISTS public.external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('sigb', 'si', 'webhook', 'api')),
  description TEXT,
  
  -- Configuration de connexion
  endpoint_url TEXT NOT NULL,
  auth_type TEXT CHECK (auth_type IN ('none', 'basic', 'bearer', 'api_key', 'oauth2')),
  auth_credentials JSONB, -- Stockage sécurisé des credentials
  
  -- Configuration de synchronisation
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
  sync_frequency TEXT CHECK (sync_frequency IN ('manual', 'realtime', 'hourly', 'daily', 'weekly')),
  auto_sync_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Mapping des données
  data_mapping JSONB, -- Configuration du mapping des champs
  sync_entities TEXT[], -- Ex: ['users', 'legal_deposits', 'catalog_metadata']
  
  -- Paramètres avancés
  timeout_seconds INTEGER DEFAULT 30,
  retry_attempts INTEGER DEFAULT 3,
  batch_size INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_integration_name UNIQUE (name)
);

-- Table pour les logs de synchronisation
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  
  -- Informations de synchronisation
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled', 'webhook', 'realtime')),
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('inbound', 'outbound')),
  entity_type TEXT, -- Ex: 'legal_deposits', 'users', 'catalog_metadata'
  
  -- Résultats
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed', 'partial')),
  records_total INTEGER DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  
  -- Détails
  error_message TEXT,
  error_details JSONB,
  sync_details JSONB, -- Détails additionnels de la synchronisation
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les erreurs de synchronisation détaillées
CREATE TABLE IF NOT EXISTS public.integration_sync_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_log_id UUID REFERENCES public.integration_sync_logs(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  
  -- Informations sur l'erreur
  error_type TEXT NOT NULL, -- Ex: 'validation', 'network', 'mapping', 'duplicate'
  error_message TEXT NOT NULL,
  error_code TEXT,
  error_stack TEXT,
  
  -- Données concernées
  entity_type TEXT,
  entity_id TEXT,
  record_data JSONB, -- Données ayant causé l'erreur
  
  -- Pour retry
  retry_count INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les webhooks entrants
CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.external_integrations(id) ON DELETE CASCADE,
  
  -- Configuration webhook
  webhook_name TEXT NOT NULL,
  webhook_secret TEXT, -- Pour valider les signatures
  allowed_ips TEXT[], -- Liste des IPs autorisées
  
  -- Événements
  event_types TEXT[] NOT NULL, -- Ex: ['user.created', 'deposit.updated']
  
  -- Sécurité
  signature_header TEXT DEFAULT 'X-Webhook-Signature',
  signature_algorithm TEXT DEFAULT 'sha256',
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour l'historique des webhooks reçus
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.integration_webhooks(id) ON DELETE CASCADE,
  
  -- Données de l'événement
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  headers JSONB,
  source_ip TEXT,
  
  -- Traitement
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Sécurité
  signature_valid BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_integration_sync_logs_integration ON public.integration_sync_logs(integration_id);
CREATE INDEX idx_integration_sync_logs_status ON public.integration_sync_logs(status);
CREATE INDEX idx_integration_sync_logs_created ON public.integration_sync_logs(created_at DESC);
CREATE INDEX idx_integration_sync_errors_log ON public.integration_sync_errors(sync_log_id);
CREATE INDEX idx_integration_sync_errors_unresolved ON public.integration_sync_errors(resolved) WHERE resolved = false;
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_created ON public.webhook_events(created_at DESC);

-- RLS Policies
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer les intégrations
CREATE POLICY "Admins can view integrations" ON public.external_integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage integrations" ON public.external_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Admins et librarians peuvent voir les logs
CREATE POLICY "Staff can view sync logs" ON public.integration_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'librarian')
    )
  );

CREATE POLICY "System can insert sync logs" ON public.integration_sync_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sync logs" ON public.integration_sync_logs
  FOR UPDATE USING (true);

-- Admins peuvent voir et gérer les erreurs
CREATE POLICY "Staff can view sync errors" ON public.integration_sync_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'librarian')
    )
  );

CREATE POLICY "System can manage sync errors" ON public.integration_sync_errors
  FOR ALL USING (true);

-- Admins peuvent gérer les webhooks
CREATE POLICY "Admins can view webhooks" ON public.integration_webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage webhooks" ON public.integration_webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Webhook events accessible par le système
CREATE POLICY "Staff can view webhook events" ON public.webhook_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'librarian')
    )
  );

CREATE POLICY "System can manage webhook events" ON public.webhook_events
  FOR ALL USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_external_integrations_updated_at
  BEFORE UPDATE ON public.external_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();