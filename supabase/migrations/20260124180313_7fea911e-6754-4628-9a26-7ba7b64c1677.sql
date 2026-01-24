-- Table pour les ressources visuelles (icônes, logos, etc.)
CREATE TABLE IF NOT EXISTS public.cms_visual_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  category TEXT NOT NULL DEFAULT 'icon',
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'svg',
  file_size INTEGER,
  tags TEXT[] DEFAULT '{}',
  description_fr TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour la recherche et le filtrage
CREATE INDEX idx_cms_visual_resources_category ON public.cms_visual_resources(category);
CREATE INDEX idx_cms_visual_resources_tags ON public.cms_visual_resources USING GIN(tags);
CREATE INDEX idx_cms_visual_resources_name ON public.cms_visual_resources(name);
CREATE INDEX idx_cms_visual_resources_active ON public.cms_visual_resources(is_active);

-- Enable RLS
ALTER TABLE public.cms_visual_resources ENABLE ROW LEVEL SECURITY;

-- Policies: Lecture publique pour les ressources actives
CREATE POLICY "Anyone can view active visual resources"
  ON public.cms_visual_resources
  FOR SELECT
  USING (is_active = true);

-- Policies: Gestion par les admins/librarians
CREATE POLICY "Admins can manage visual resources"
  ON public.cms_visual_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'librarian', 'editor')
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_cms_visual_resources_updated_at
  BEFORE UPDATE ON public.cms_visual_resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.cms_visual_resources IS 'Collection de ressources visuelles (icônes, logos) pour le CMS';
COMMENT ON COLUMN public.cms_visual_resources.category IS 'Catégorie: icon, logo, illustration, pictogram';
COMMENT ON COLUMN public.cms_visual_resources.file_type IS 'Type de fichier: svg, png, webp';