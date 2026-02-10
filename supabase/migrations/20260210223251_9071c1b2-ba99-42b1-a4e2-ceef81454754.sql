
-- Add section column to ui_translations for organizing by page/menu/form/section
ALTER TABLE public.ui_translations ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'general';

-- Add index for section filtering
CREATE INDEX IF NOT EXISTS idx_ui_translations_section ON public.ui_translations (section);

-- Update category index too  
CREATE INDEX IF NOT EXISTS idx_ui_translations_category ON public.ui_translations (category);
