-- Add missing columns to languages table
ALTER TABLE public.languages 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'ltr';

-- Update existing rows
UPDATE public.languages
SET orientation = 'ltr'
WHERE orientation IS NULL;

UPDATE public.languages
SET orientation = 'rtl'
WHERE code = 'ar';

-- Make orientation non-null and add constraint
ALTER TABLE public.languages
  ALTER COLUMN orientation SET NOT NULL;

-- Add constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'languages_orientation_check'
  ) THEN
    ALTER TABLE public.languages
      ADD CONSTRAINT languages_orientation_check CHECK (orientation IN ('ltr', 'rtl'));
  END IF;
END $$;

-- Update trigger for updated_at
DROP TRIGGER IF EXISTS update_languages_updated_at ON public.languages;
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON public.languages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();