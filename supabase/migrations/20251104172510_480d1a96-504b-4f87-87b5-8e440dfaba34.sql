-- Table pour stocker les formulaires configurables
CREATE TABLE IF NOT EXISTS public.configurable_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('bnrm', 'depot_legal', 'bn', 'activites_culturelles', 'cbn')),
  module TEXT NOT NULL,
  form_name TEXT NOT NULL,
  form_key TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(platform, module, form_key)
);

-- Table pour les versions de formulaires
CREATE TABLE IF NOT EXISTS public.form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.configurable_forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  structure JSONB NOT NULL DEFAULT '{"sections": []}',
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(form_id, version_number)
);

-- Table pour les champs personnalisés
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_version_id UUID NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'textarea', 'select', 'multiselect', 'date', 'number', 
    'boolean', 'link', 'location', 'coordinates', 'reference', 
    'file', 'group'
  )),
  section_key TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  insert_after TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  label_fr TEXT NOT NULL,
  label_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  is_required BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  is_readonly BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  validation_rules JSONB DEFAULT '{}',
  visibility_conditions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),
  UNIQUE(form_version_id, field_key)
);

-- Table pour l'historique des modifications
CREATE TABLE IF NOT EXISTS public.form_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.configurable_forms(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'rollback')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('form', 'field', 'version')),
  entity_id UUID,
  diff JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_custom_fields_form_version ON public.custom_fields(form_version_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_section ON public.custom_fields(section_key);
CREATE INDEX IF NOT EXISTS idx_custom_fields_deleted ON public.custom_fields(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_form_versions_form_id ON public.form_versions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_versions_published ON public.form_versions(is_published);
CREATE INDEX IF NOT EXISTS idx_form_audit_log_form_id ON public.form_audit_log(form_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_configurable_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_configurable_forms_updated_at
BEFORE UPDATE ON public.configurable_forms
FOR EACH ROW EXECUTE FUNCTION update_configurable_forms_updated_at();

CREATE OR REPLACE FUNCTION update_custom_fields_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_custom_fields_updated_at
BEFORE UPDATE ON public.custom_fields
FOR EACH ROW EXECUTE FUNCTION update_custom_fields_updated_at();

-- RLS Policies
ALTER TABLE public.configurable_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins et Super-admins peuvent tout faire
CREATE POLICY "Admins can manage forms"
ON public.configurable_forms
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage form versions"
ON public.form_versions
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage custom fields"
ON public.custom_fields
FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can view audit log"
ON public.form_audit_log
FOR SELECT
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can insert audit log"
ON public.form_audit_log
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_librarian(auth.uid()));