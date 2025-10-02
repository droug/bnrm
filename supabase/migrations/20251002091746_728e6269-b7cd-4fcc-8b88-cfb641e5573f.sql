-- Table pour les métadonnées du catalogue
CREATE TABLE IF NOT EXISTS public.catalog_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  
  -- Métadonnées bibliographiques standards
  isbn TEXT,
  issn TEXT,
  dewey_classification TEXT,
  udc_classification TEXT,
  cdu_classification TEXT,
  
  -- Informations bibliographiques
  original_title TEXT,
  translated_title TEXT,
  subtitle TEXT,
  series_title TEXT,
  volume_number TEXT,
  edition TEXT,
  publication_place TEXT,
  publisher TEXT,
  publication_year INTEGER,
  
  -- Auteurs et contributeurs
  main_author TEXT,
  co_authors TEXT[],
  translators TEXT[],
  illustrators TEXT[],
  editors TEXT[],
  
  -- Description physique
  page_count INTEGER,
  physical_description TEXT,
  format_size TEXT,
  illustrations_type TEXT,
  
  -- Sujets et classification
  subjects TEXT[],
  keywords TEXT[],
  geographic_coverage TEXT[],
  time_period TEXT,
  
  -- Notes et annotations
  general_notes TEXT,
  content_notes TEXT,
  missing_pages_reason TEXT,
  conservation_notes TEXT,
  
  -- Droits et accès
  copyright_status TEXT,
  access_rights TEXT,
  usage_restrictions TEXT,
  
  -- Informations de source
  source_sigb TEXT,
  source_record_id TEXT,
  import_date TIMESTAMP WITH TIME ZONE,
  last_sync_date TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées techniques
  digital_format TEXT,
  file_size_mb NUMERIC,
  resolution_dpi INTEGER,
  color_mode TEXT,
  
  -- Données complémentaires personnalisables
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Contraintes
  CONSTRAINT at_least_one_reference CHECK (
    manuscript_id IS NOT NULL OR content_id IS NOT NULL
  )
);

-- Table pour l'historique des imports de métadonnées
CREATE TABLE IF NOT EXISTS public.metadata_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL CHECK (import_type IN ('automatic', 'manual', 'migration')),
  source_system TEXT NOT NULL,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  records_imported INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  import_status TEXT CHECK (import_status IN ('pending', 'in_progress', 'completed', 'failed', 'partial')),
  error_log JSONB,
  imported_by UUID REFERENCES auth.users(id),
  import_parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les exports de métadonnées
CREATE TABLE IF NOT EXISTS public.metadata_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_format TEXT NOT NULL CHECK (export_format IN ('marc21', 'unimarc', 'dublin_core', 'mods', 'csv', 'json', 'xml')),
  export_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  records_count INTEGER,
  file_path TEXT,
  file_size_mb NUMERIC,
  export_status TEXT CHECK (export_status IN ('pending', 'in_progress', 'completed', 'failed')),
  exported_by UUID REFERENCES auth.users(id),
  export_filters JSONB,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour la configuration SIGB
CREATE TABLE IF NOT EXISTS public.sigb_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  api_endpoint TEXT,
  api_version TEXT,
  authentication_type TEXT,
  sync_frequency TEXT CHECK (sync_frequency IN ('real_time', 'hourly', 'daily', 'weekly', 'manual')),
  last_sync_date TIMESTAMP WITH TIME ZONE,
  next_sync_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sync_enabled BOOLEAN DEFAULT false,
  configuration_params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  configured_by UUID REFERENCES auth.users(id)
);

-- Table pour les logs de synchronisation SIGB
CREATE TABLE IF NOT EXISTS public.sigb_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.sigb_configuration(id) ON DELETE CASCADE,
  sync_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_end TIMESTAMP WITH TIME ZONE,
  sync_status TEXT CHECK (sync_status IN ('started', 'in_progress', 'completed', 'failed', 'partial')),
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  sync_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_manuscript ON public.catalog_metadata(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_content ON public.catalog_metadata(content_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_isbn ON public.catalog_metadata(isbn);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_issn ON public.catalog_metadata(issn);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_source ON public.catalog_metadata(source_sigb, source_record_id);
CREATE INDEX IF NOT EXISTS idx_metadata_import_date ON public.metadata_import_history(import_date DESC);
CREATE INDEX IF NOT EXISTS idx_metadata_export_date ON public.metadata_exports(export_date DESC);
CREATE INDEX IF NOT EXISTS idx_sigb_sync_logs_date ON public.sigb_sync_logs(sync_start DESC);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_catalog_metadata_updated_at
  BEFORE UPDATE ON public.catalog_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sigb_configuration_updated_at
  BEFORE UPDATE ON public.sigb_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies pour catalog_metadata
ALTER TABLE public.catalog_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les métadonnées"
  ON public.catalog_metadata FOR SELECT
  USING (true);

CREATE POLICY "Admins et bibliothécaires peuvent gérer les métadonnées"
  ON public.catalog_metadata FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour metadata_import_history
ALTER TABLE public.metadata_import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins et bibliothécaires peuvent voir l'historique des imports"
  ON public.metadata_import_history FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Système peut insérer dans l'historique"
  ON public.metadata_import_history FOR INSERT
  WITH CHECK (true);

-- RLS Policies pour metadata_exports
ALTER TABLE public.metadata_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs peuvent voir leurs exports"
  ON public.metadata_exports FOR SELECT
  USING (exported_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Utilisateurs authentifiés peuvent créer des exports"
  ON public.metadata_exports FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies pour sigb_configuration
ALTER TABLE public.sigb_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer la configuration SIGB"
  ON public.sigb_configuration FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour sigb_sync_logs
ALTER TABLE public.sigb_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent voir les logs de synchronisation"
  ON public.sigb_sync_logs FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Système peut insérer des logs de synchronisation"
  ON public.sigb_sync_logs FOR INSERT
  WITH CHECK (true);