-- Create storage bucket for professional registration files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-documents',
  'professional-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for professional-documents bucket
CREATE POLICY "Anyone can upload professional documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'professional-documents');

CREATE POLICY "Authenticated users can view professional documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'professional-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage professional documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'professional-documents' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);