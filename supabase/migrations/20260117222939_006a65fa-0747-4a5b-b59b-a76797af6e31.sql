-- Create storage bucket for VExpo 360 assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vexpo-assets',
  'vexpo-assets',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Allow public read access
CREATE POLICY "Public read access for vexpo assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'vexpo-assets');

-- Allow authenticated users with vexpo roles to upload
CREATE POLICY "Authenticated users can upload vexpo assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vexpo-assets'
  AND (
    EXISTS (
      SELECT 1 FROM vexpo_user_roles 
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Allow users to update their uploads
CREATE POLICY "Users can update vexpo assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vexpo-assets'
  AND (
    EXISTS (
      SELECT 1 FROM vexpo_user_roles 
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);

-- Allow users to delete their uploads
CREATE POLICY "Users can delete vexpo assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vexpo-assets'
  AND (
    EXISTS (
      SELECT 1 FROM vexpo_user_roles 
      WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
);