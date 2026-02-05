-- Add sort_order column for custom document ordering in "Derniers ajouts" section
ALTER TABLE public.digital_library_documents 
ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_digital_library_documents_sort_order 
ON public.digital_library_documents(sort_order ASC NULLS LAST, created_at DESC);

-- Set initial sort_order based on created_at for existing documents
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM public.digital_library_documents
  WHERE deleted_at IS NULL
)
UPDATE public.digital_library_documents d
SET sort_order = r.rn
FROM ranked r
WHERE d.id = r.id AND d.sort_order IS NULL;