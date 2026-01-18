-- Add platform column to distinguish Hero settings for different platforms
ALTER TABLE public.cms_hero_settings 
ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'portal';

-- Update existing row to be for portal
UPDATE public.cms_hero_settings SET platform = 'portal' WHERE platform IS NULL OR platform = 'portal';

-- Insert a separate row for digital library (BN)
INSERT INTO public.cms_hero_settings (
  platform,
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
) 
SELECT 
  'bn',
  NULL,
  'Bibliothèque Numérique Ibn Battuta',
  'مكتبة ابن بطوطة الرقمية',
  'Explorez notre patrimoine numérisé',
  'اكتشفوا تراثنا الرقمي',
  'Explorer les collections',
  'استكشاف المجموعات',
  '/digital-library/collections',
  'Manuscrits',
  'المخطوطات',
  '/digital-library/collections/manuscripts'
WHERE NOT EXISTS (
  SELECT 1 FROM public.cms_hero_settings WHERE platform = 'bn'
);

-- Create unique constraint on platform
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_hero_settings_platform ON public.cms_hero_settings(platform);