
-- Table for storing UI translations (overrides and new keys)
CREATE TABLE public.ui_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  translation_key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'custom', -- 'portal', 'digital_library', 'custom'
  category TEXT DEFAULT 'general',
  fr TEXT,
  ar TEXT,
  en TEXT,
  es TEXT,
  amz TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(translation_key)
);

-- Enable RLS
ALTER TABLE public.ui_translations ENABLE ROW LEVEL SECURITY;

-- Public read access for translations
CREATE POLICY "Anyone can read translations" 
ON public.ui_translations FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Authenticated users can insert translations"
ON public.ui_translations FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update translations"
ON public.ui_translations FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete translations"
ON public.ui_translations FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Index for fast key lookup
CREATE INDEX idx_ui_translations_key ON public.ui_translations(translation_key);
CREATE INDEX idx_ui_translations_source ON public.ui_translations(source);
CREATE INDEX idx_ui_translations_category ON public.ui_translations(category);

-- Trigger for updated_at
CREATE TRIGGER update_ui_translations_updated_at
BEFORE UPDATE ON public.ui_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
