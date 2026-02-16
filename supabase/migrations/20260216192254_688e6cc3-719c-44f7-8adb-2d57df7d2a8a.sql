
-- Table pour les modèles de restrictions réutilisables
CREATE TABLE public.restriction_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_restricted BOOLEAN NOT NULL DEFAULT true,
  restriction_mode TEXT NOT NULL DEFAULT 'range',
  start_page INTEGER DEFAULT 1,
  end_page INTEGER DEFAULT 10,
  manual_pages INTEGER[] DEFAULT '{}',
  percentage_value INTEGER DEFAULT 10,
  percentage_distribution TEXT DEFAULT 'start',
  allow_physical_consultation BOOLEAN DEFAULT false,
  allow_download BOOLEAN DEFAULT true,
  allow_screenshot BOOLEAN DEFAULT true,
  allow_right_click BOOLEAN DEFAULT true,
  restricted_page_display TEXT DEFAULT 'blur',
  restricted_page_display_reason TEXT DEFAULT 'Pages du document numérique consultables intégralement sur place',
  allow_double_page_view BOOLEAN DEFAULT true,
  allow_scroll_view BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.restriction_templates ENABLE ROW LEVEL SECURITY;

-- Policies: only admins/librarians can manage templates
CREATE POLICY "Admins can manage restriction templates"
ON public.restriction_templates
FOR ALL
USING (public.is_admin_or_librarian(auth.uid()))
WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_restriction_templates_updated_at
BEFORE UPDATE ON public.restriction_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_page_restrictions_updated_at();
