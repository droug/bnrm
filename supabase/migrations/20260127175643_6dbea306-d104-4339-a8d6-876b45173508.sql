-- Create storage bucket for tutorial videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutorial-videos',
  'tutorial-videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Tutorial videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutorial-videos');

-- Allow authenticated users with admin/librarian role to upload
CREATE POLICY "Admins can upload tutorial videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tutorial-videos' 
  AND auth.role() = 'authenticated'
);

-- Allow admins to update their uploads
CREATE POLICY "Admins can update tutorial videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tutorial-videos' AND auth.role() = 'authenticated');

-- Allow admins to delete videos
CREATE POLICY "Admins can delete tutorial videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tutorial-videos' AND auth.role() = 'authenticated');