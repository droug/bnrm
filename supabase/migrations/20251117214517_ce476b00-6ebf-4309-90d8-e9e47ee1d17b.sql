-- Créer le bucket de stockage pour les médias du CMS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-media',
  'cms-media',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS policies pour le bucket cms-media
CREATE POLICY "Admins et bibliothécaires peuvent uploader des médias"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cms-media'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);

CREATE POLICY "Admins et bibliothécaires peuvent mettre à jour des médias"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cms-media'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);

CREATE POLICY "Admins et bibliothécaires peuvent supprimer des médias"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cms-media'
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);

CREATE POLICY "Tout le monde peut voir les médias"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cms-media');