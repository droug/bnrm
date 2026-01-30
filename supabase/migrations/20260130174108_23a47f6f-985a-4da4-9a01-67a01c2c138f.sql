-- Add publication_date column for storing full date (YYYY-MM-DD)
-- publication_year will be kept for backward compatibility and derived from publication_date

ALTER TABLE public.digital_library_documents
ADD COLUMN IF NOT EXISTS publication_date DATE NULL;

-- Optionally populate publication_date from existing publication_year (set to Jan 1st of that year)
UPDATE public.digital_library_documents
SET publication_date = MAKE_DATE(publication_year, 1, 1)
WHERE publication_year IS NOT NULL AND publication_date IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.digital_library_documents.publication_date IS 'Full publication date (YYYY-MM-DD). Used for more precise date filtering.';