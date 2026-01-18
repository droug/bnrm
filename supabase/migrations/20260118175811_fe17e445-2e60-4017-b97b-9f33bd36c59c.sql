-- Table for portal styling and theme settings
CREATE TABLE public.cms_portal_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_portal_settings ENABLE ROW LEVEL SECURITY;

-- Policy: admins and librarians can read/write
CREATE POLICY "Admins and librarians can manage portal settings" 
ON public.cms_portal_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Policy: public read access
CREATE POLICY "Public can read portal settings" 
ON public.cms_portal_settings 
FOR SELECT 
USING (true);

-- Table for mediatheque videos management
CREATE TABLE public.cms_mediatheque_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  thumbnail_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_mediatheque_videos ENABLE ROW LEVEL SECURITY;

-- Policy: admins and librarians can manage
CREATE POLICY "Admins and librarians can manage mediatheque videos" 
ON public.cms_mediatheque_videos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Policy: public read
CREATE POLICY "Public can read mediatheque videos" 
ON public.cms_mediatheque_videos 
FOR SELECT 
USING (is_active = true);

-- Table for digital services section
CREATE TABLE public.cms_digital_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  category_fr TEXT,
  category_ar TEXT,
  image_url TEXT,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_digital_services ENABLE ROW LEVEL SECURITY;

-- Policy: admins and librarians can manage
CREATE POLICY "Admins and librarians can manage digital services" 
ON public.cms_digital_services 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Policy: public read
CREATE POLICY "Public can read digital services" 
ON public.cms_digital_services 
FOR SELECT 
USING (is_active = true);

-- Insert default styling settings
INSERT INTO public.cms_portal_settings (setting_key, setting_value, category, description) VALUES
('section_styles', '{
  "services_numeriques": {
    "background_color": "#f8fafc",
    "title_color": "#1e293b",
    "button_bg_color": "#1e40af",
    "button_text_color": "#ffffff",
    "card_bg_color": "#ffffff"
  },
  "mediatheque": {
    "background_color": "#1e3a5f",
    "title_color": "#ffffff",
    "button_bg_color": "#3b82f6",
    "button_text_color": "#ffffff",
    "accent_color": "#d4af37"
  }
}', 'styling', 'Couleurs des sections de la page d''accueil'),
('typography', '{
  "heading_font": "Playfair Display",
  "body_font": "Inter",
  "button_font": "Inter"
}', 'styling', 'Polices typographiques du portail'),
('button_styles', '{
  "primary": {
    "background": "#1e40af",
    "text": "#ffffff",
    "border_radius": "8px"
  },
  "secondary": {
    "background": "#f1f5f9",
    "text": "#1e293b",
    "border_radius": "8px"
  }
}', 'styling', 'Styles des boutons');

-- Trigger for updated_at
CREATE TRIGGER update_cms_portal_settings_updated_at
BEFORE UPDATE ON public.cms_portal_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_mediatheque_videos_updated_at
BEFORE UPDATE ON public.cms_mediatheque_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_digital_services_updated_at
BEFORE UPDATE ON public.cms_digital_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();