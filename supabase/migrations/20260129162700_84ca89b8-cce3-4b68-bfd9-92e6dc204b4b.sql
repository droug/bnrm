-- Create storage bucket for electronic bundles logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'electronic-bundles-logos',
  'electronic-bundles-logos',
  true,
  5242880, -- 5MB max
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Public read access for electronic bundles logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'electronic-bundles-logos');

CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'electronic-bundles-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'electronic-bundles-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'electronic-bundles-logos' AND auth.role() = 'authenticated');