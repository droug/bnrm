-- Create SIGB Sync Runs table
CREATE TABLE IF NOT EXISTS public.sigb_sync_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.sigb_sync_config(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  created_records INTEGER DEFAULT 0,
  updated_records INTEGER DEFAULT 0,
  skipped_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  duplicate_records INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by UUID,
  run_type TEXT DEFAULT 'manual' CHECK (run_type IN ('manual', 'scheduled', 'retry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Sync Run Items table
CREATE TABLE IF NOT EXISTS public.sigb_sync_run_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.sigb_sync_runs(id) ON DELETE CASCADE,
  source_record_id TEXT NOT NULL,
  document_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'created', 'updated', 'skipped', 'failed', 'duplicate')),
  error_message TEXT,
  source_data JSONB,
  mapped_data JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Metadata Mapping table
CREATE TABLE IF NOT EXISTS public.sigb_metadata_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID REFERENCES public.sigb_sync_config(id) ON DELETE CASCADE,
  source_field TEXT NOT NULL,
  target_field TEXT NOT NULL,
  transformation_rule TEXT,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Duplicate Cases table
CREATE TABLE IF NOT EXISTS public.sigb_duplicate_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID REFERENCES public.sigb_sync_runs(id) ON DELETE SET NULL,
  source_record_id TEXT NOT NULL,
  existing_document_id UUID,
  match_type TEXT NOT NULL CHECK (match_type IN ('exact', 'fuzzy', 'partial')),
  match_score NUMERIC(5,2),
  match_fields JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'merged', 'kept_new', 'kept_existing', 'ignored')),
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  source_data JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Duplicate Events table
CREATE TABLE IF NOT EXISTS public.sigb_duplicate_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.sigb_duplicate_cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Sync Rejections table
CREATE TABLE IF NOT EXISTS public.sigb_sync_rejections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID REFERENCES public.sigb_sync_runs(id) ON DELETE SET NULL,
  source_record_id TEXT NOT NULL,
  rejection_reason TEXT NOT NULL,
  rejection_details JSONB,
  source_data JSONB,
  can_retry BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create SIGB Duplicate Settings table
CREATE TABLE IF NOT EXISTS public.sigb_duplicate_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_strategy TEXT NOT NULL DEFAULT 'balanced' CHECK (match_strategy IN ('strict', 'balanced', 'lenient')),
  auto_merge_threshold NUMERIC(5,2) DEFAULT 95.00,
  auto_reject_threshold NUMERIC(5,2) DEFAULT 30.00,
  match_fields JSONB DEFAULT '["cote", "title", "author", "isbn"]'::jsonb,
  fuzzy_match_enabled BOOLEAN DEFAULT true,
  similarity_algorithm TEXT DEFAULT 'levenshtein',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sigb_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_sync_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_metadata_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_duplicate_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_duplicate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_sync_rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_duplicate_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sigb_sync_runs
CREATE POLICY "sigb_sync_runs_select_policy" ON public.sigb_sync_runs
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_runs_insert_policy" ON public.sigb_sync_runs
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_runs_update_policy" ON public.sigb_sync_runs
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_runs_delete_policy" ON public.sigb_sync_runs
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for sigb_sync_run_items
CREATE POLICY "sigb_sync_run_items_select_policy" ON public.sigb_sync_run_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_run_items_insert_policy" ON public.sigb_sync_run_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_run_items_update_policy" ON public.sigb_sync_run_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

-- Create RLS policies for sigb_metadata_mapping
CREATE POLICY "sigb_metadata_mapping_select_policy" ON public.sigb_metadata_mapping
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_metadata_mapping_all_policy" ON public.sigb_metadata_mapping
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create RLS policies for sigb_duplicate_cases
CREATE POLICY "sigb_duplicate_cases_select_policy" ON public.sigb_duplicate_cases
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_duplicate_cases_modify_policy" ON public.sigb_duplicate_cases
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

-- Create RLS policies for sigb_duplicate_events
CREATE POLICY "sigb_duplicate_events_select_policy" ON public.sigb_duplicate_events
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_duplicate_events_insert_policy" ON public.sigb_duplicate_events
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

-- Create RLS policies for sigb_sync_rejections
CREATE POLICY "sigb_sync_rejections_select_policy" ON public.sigb_sync_rejections
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_sync_rejections_all_policy" ON public.sigb_sync_rejections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

-- Create RLS policies for sigb_duplicate_settings
CREATE POLICY "sigb_duplicate_settings_select_policy" ON public.sigb_duplicate_settings
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'librarian')));

CREATE POLICY "sigb_duplicate_settings_all_policy" ON public.sigb_duplicate_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sigb_sync_runs_config ON public.sigb_sync_runs(config_id);
CREATE INDEX IF NOT EXISTS idx_sigb_sync_runs_status ON public.sigb_sync_runs(status);
CREATE INDEX IF NOT EXISTS idx_sigb_sync_run_items_run ON public.sigb_sync_run_items(run_id);
CREATE INDEX IF NOT EXISTS idx_sigb_sync_run_items_status ON public.sigb_sync_run_items(status);
CREATE INDEX IF NOT EXISTS idx_sigb_duplicate_cases_status ON public.sigb_duplicate_cases(status);
CREATE INDEX IF NOT EXISTS idx_sigb_sync_rejections_run ON public.sigb_sync_rejections(run_id);

-- Create updated_at triggers
CREATE TRIGGER update_sigb_metadata_mapping_updated_at
  BEFORE UPDATE ON public.sigb_metadata_mapping
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sigb_duplicate_cases_updated_at
  BEFORE UPDATE ON public.sigb_duplicate_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sigb_duplicate_settings_updated_at
  BEFORE UPDATE ON public.sigb_duplicate_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default duplicate settings
INSERT INTO public.sigb_duplicate_settings (match_strategy, auto_merge_threshold, auto_reject_threshold, match_fields, fuzzy_match_enabled)
VALUES ('balanced', 95.00, 30.00, '["cote", "title", "author", "isbn"]'::jsonb, true)
ON CONFLICT DO NOTHING;