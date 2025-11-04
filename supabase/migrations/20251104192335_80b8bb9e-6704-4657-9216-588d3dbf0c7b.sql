-- Table pour définir les sections de formulaires
CREATE TABLE IF NOT EXISTS public.form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_name_fr TEXT NOT NULL,
  section_name_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(form_key, section_key)
);

-- Table pour les champs personnalisés par section
CREATE TABLE IF NOT EXISTS public.section_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.form_sections(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  label_ar TEXT DEFAULT '',
  description_fr TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  placeholder_fr TEXT DEFAULT '',
  placeholder_ar TEXT DEFAULT '',
  is_required BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_readonly BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  validation_rules JSONB,
  default_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(section_id, field_key)
);

-- Enable RLS
ALTER TABLE public.form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_custom_fields ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour form_sections
CREATE POLICY "Everyone can view active sections"
  ON public.form_sections FOR SELECT
  USING (is_active = true OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage sections"
  ON public.form_sections FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour section_custom_fields
CREATE POLICY "Everyone can view visible fields"
  ON public.section_custom_fields FOR SELECT
  USING (
    is_visible = true OR is_admin_or_librarian(auth.uid())
  );

CREATE POLICY "Admins can manage custom fields"
  ON public.section_custom_fields FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Insérer les sections pour le formulaire "Dépôt légal - Monographies"
INSERT INTO public.form_sections (form_key, section_key, section_name_fr, section_name_ar, order_index) VALUES
  ('legal_deposit_monograph', 'author_identification', 'Identification de l''auteur', 'تعريف المؤلف', 1),
  ('legal_deposit_monograph', 'publication_identification', 'Identification de la publication', 'تعريف المنشور', 2),
  ('legal_deposit_monograph', 'publisher_info', 'Éditeur', 'الناشر', 3),
  ('legal_deposit_monograph', 'printer_info', 'Imprimeur', 'المطبعة', 4)
ON CONFLICT (form_key, section_key) DO NOTHING;

-- Créer des index pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_form_sections_form_key ON public.form_sections(form_key);
CREATE INDEX IF NOT EXISTS idx_form_sections_order ON public.form_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_section_custom_fields_section_id ON public.section_custom_fields(section_id);
CREATE INDEX IF NOT EXISTS idx_section_custom_fields_order ON public.section_custom_fields(order_index);