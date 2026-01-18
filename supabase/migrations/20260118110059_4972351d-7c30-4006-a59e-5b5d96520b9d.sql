-- Create cms_hero_settings table for managing Hero section content
CREATE TABLE IF NOT EXISTS public.cms_hero_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_image_url TEXT,
  hero_title_fr TEXT,
  hero_title_ar TEXT,
  hero_subtitle_fr TEXT,
  hero_subtitle_ar TEXT,
  hero_cta_label_fr TEXT,
  hero_cta_label_ar TEXT,
  hero_cta_url TEXT,
  hero_secondary_cta_label_fr TEXT,
  hero_secondary_cta_label_ar TEXT,
  hero_secondary_cta_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cms_hero_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Hero settings are publicly readable"
  ON public.cms_hero_settings
  FOR SELECT
  USING (true);

-- Allow admins to update (using existing roles)
CREATE POLICY "Admins can update hero settings"
  ON public.cms_hero_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'librarian')
    )
  );

-- Allow admins to insert
CREATE POLICY "Admins can insert hero settings"
  ON public.cms_hero_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'librarian')
    )
  );

-- Insert default hero settings
INSERT INTO public.cms_hero_settings (
  hero_image_url,
  hero_title_fr,
  hero_title_ar,
  hero_subtitle_fr,
  hero_subtitle_ar,
  hero_cta_label_fr,
  hero_cta_label_ar,
  hero_cta_url,
  hero_secondary_cta_label_fr,
  hero_secondary_cta_label_ar,
  hero_secondary_cta_url
) VALUES (
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1920&q=80',
  'Bienvenue à la Bibliothèque Nationale du Royaume du Maroc',
  'مرحباً بكم في المكتبة الوطنية للمملكة المغربية',
  'Découvrez notre patrimoine documentaire et culturel',
  'اكتشفوا تراثنا الوثائقي والثقافي',
  'Explorer les collections',
  'استكشاف المجموعات',
  '/digital-library',
  'Visionneuse de manuscrits',
  'عارض المخطوطات',
  '/manuscripts'
);