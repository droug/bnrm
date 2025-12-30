-- Add page_count and pages_path columns to content table and update the document
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS page_count INTEGER;
ALTER TABLE public.content ADD COLUMN IF NOT EXISTS pages_path TEXT;

UPDATE public.content
SET 
  page_count = 50,
  pages_path = '/documents/matalib-pages',
  updated_at = NOW()
WHERE id = 'f74bf753-4018-41ae-b182-877fc7e192c1';