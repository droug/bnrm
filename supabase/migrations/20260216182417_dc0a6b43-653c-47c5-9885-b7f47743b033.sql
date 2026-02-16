
-- Add batch_name column to digital_library_documents for batch grouping
ALTER TABLE public.digital_library_documents 
ADD COLUMN IF NOT EXISTS batch_name TEXT DEFAULT NULL;

-- Create index for fast batch filtering
CREATE INDEX IF NOT EXISTS idx_digital_library_documents_batch_name 
ON public.digital_library_documents (batch_name) 
WHERE batch_name IS NOT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN public.digital_library_documents.batch_name IS 'Nom du lot lors de l''import par lot, utilisé pour le Multi-OCR et les restrictions par lot';
