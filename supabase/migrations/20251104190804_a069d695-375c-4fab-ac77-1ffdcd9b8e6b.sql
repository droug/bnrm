-- Create forms table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key TEXT NOT NULL UNIQUE,
  form_name TEXT NOT NULL,
  description TEXT,
  module TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form_versions table
CREATE TABLE IF NOT EXISTS public.form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  structure JSONB NOT NULL DEFAULT '{"sections": []}'::jsonb,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(form_id, version_number)
);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_version_id UUID NOT NULL REFERENCES public.form_versions(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  label_ar TEXT DEFAULT '',
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  is_required BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_readonly BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  config JSONB,
  validation_rules JSONB,
  visibility_conditions JSONB,
  default_value TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(form_version_id, field_key)
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms (with DO $$ block to avoid duplicate errors)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forms' AND policyname = 'Everyone can view active forms') THEN
    CREATE POLICY "Everyone can view active forms"
      ON public.forms FOR SELECT
      USING (is_active = true OR is_admin_or_librarian(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forms' AND policyname = 'Admins can manage forms') THEN
    CREATE POLICY "Admins can manage forms"
      ON public.forms FOR ALL
      USING (is_admin_or_librarian(auth.uid()));
  END IF;
END $$;

-- RLS Policies for form_versions
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_versions' AND policyname = 'Everyone can view published versions') THEN
    CREATE POLICY "Everyone can view published versions"
      ON public.form_versions FOR SELECT
      USING (is_published = true OR is_admin_or_librarian(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_versions' AND policyname = 'Admins can manage form versions') THEN
    CREATE POLICY "Admins can manage form versions"
      ON public.form_versions FOR ALL
      USING (is_admin_or_librarian(auth.uid()));
  END IF;
END $$;

-- RLS Policies for custom_fields
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'Everyone can view fields of published versions') THEN
    CREATE POLICY "Everyone can view fields of published versions"
      ON public.custom_fields FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.form_versions
          WHERE form_versions.id = custom_fields.form_version_id
          AND (form_versions.is_published = true OR is_admin_or_librarian(auth.uid()))
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'Admins can manage custom fields') THEN
    CREATE POLICY "Admins can manage custom fields"
      ON public.custom_fields FOR ALL
      USING (is_admin_or_librarian(auth.uid()));
  END IF;
END $$;

-- Insert the legal deposit monograph form
INSERT INTO public.forms (form_key, form_name, description, module, is_active)
VALUES (
  'legal_deposit_monograph',
  'Dépôt légal - Monographies',
  'Formulaire de dépôt légal pour les monographies',
  'legal_deposit',
  true
)
ON CONFLICT (form_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_versions_form_id ON public.form_versions(form_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_form_version_id ON public.custom_fields(form_version_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_section_key ON public.custom_fields(section_key);
CREATE INDEX IF NOT EXISTS idx_custom_fields_order_index ON public.custom_fields(order_index);