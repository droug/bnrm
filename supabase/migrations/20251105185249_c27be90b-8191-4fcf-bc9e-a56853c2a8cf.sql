-- Créer la table pour les configurations d'interconnexions
CREATE TABLE IF NOT EXISTS public.external_system_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL UNIQUE,
  system_type TEXT NOT NULL CHECK (system_type IN ('catalog', 'sigb', 'z3950', 'oai-pmh', 'sru', 'other')),
  display_name TEXT NOT NULL,
  description TEXT,
  base_url TEXT,
  api_key_encrypted TEXT,
  username TEXT,
  password_encrypted TEXT,
  additional_params JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT false,
  is_configured BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  sync_frequency_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_external_systems_active ON public.external_system_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_external_systems_type ON public.external_system_configs(system_type);

-- RLS pour sécuriser l'accès
ALTER TABLE public.external_system_configs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent accéder
CREATE POLICY "Admins can manage external system configs"
  ON public.external_system_configs
  FOR ALL
  USING (public.is_admin_or_librarian(auth.uid()))
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_external_system_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_external_system_configs_updated_at
  BEFORE UPDATE ON public.external_system_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_external_system_configs_updated_at();

-- Table pour l'historique de synchronisation
CREATE TABLE IF NOT EXISTS public.external_system_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_config_id UUID REFERENCES public.external_system_configs(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMPTZ DEFAULT NOW(),
  sync_completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'error', 'warning')),
  records_processed INTEGER DEFAULT 0,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_config ON public.external_system_sync_logs(system_config_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.external_system_sync_logs(status);

ALTER TABLE public.external_system_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
  ON public.external_system_sync_logs
  FOR SELECT
  USING (public.is_admin_or_librarian(auth.uid()));

-- Insérer les configurations par défaut
INSERT INTO public.external_system_configs (system_name, system_type, display_name, description, is_active, is_configured)
VALUES 
  ('muc_catalog', 'catalog', 'Catalogue MUC', 'Catalogue fédéré MUC DeepWebAccess', false, false),
  ('local_sigb', 'sigb', 'SIGB Local', 'Système Intégré de Gestion de Bibliothèque', false, false),
  ('z3950_server', 'z3950', 'Serveur Z39.50', 'Interconnexion Z39.50 pour catalogage partagé', false, false),
  ('oai_pmh', 'oai-pmh', 'OAI-PMH', 'Protocol OAI-PMH pour moissonnage de métadonnées', false, false)
ON CONFLICT (system_name) DO NOTHING;

COMMENT ON TABLE public.external_system_configs IS 'Configuration des systèmes externes interconnectés';
COMMENT ON TABLE public.external_system_sync_logs IS 'Historique des synchronisations avec les systèmes externes';