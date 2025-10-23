-- Update languages table structure to match requirements
-- Add missing columns if they don't exist
ALTER TABLE public.languages 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS orientation TEXT;

-- Migrate data from is_rtl to orientation if orientation is null
UPDATE public.languages
SET orientation = CASE WHEN is_rtl THEN 'rtl' ELSE 'ltr' END
WHERE orientation IS NULL;

-- Make orientation non-null and add constraint
ALTER TABLE public.languages
  ALTER COLUMN orientation SET NOT NULL,
  ALTER COLUMN orientation SET DEFAULT 'ltr',
  ADD CONSTRAINT languages_orientation_check CHECK (orientation IN ('ltr', 'rtl'));

-- Drop is_rtl column if exists
ALTER TABLE public.languages DROP COLUMN IF EXISTS is_rtl;

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_languages_updated_at ON public.languages;
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON public.languages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();