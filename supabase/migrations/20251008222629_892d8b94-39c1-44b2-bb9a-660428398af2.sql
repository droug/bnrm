-- Créer le bucket pour les documents professionnels
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-documents',
  'professional-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'image/webp']
);

-- Politique de storage : les utilisateurs peuvent uploader leurs propres documents
CREATE POLICY "Users can upload their own professional documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'professional-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique de storage : les utilisateurs peuvent voir leurs propres documents
CREATE POLICY "Users can view their own professional documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR is_admin_or_librarian(auth.uid())
  )
);

-- Politique de storage : les admins peuvent voir tous les documents
CREATE POLICY "Admins can view all professional documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'professional-documents' 
  AND is_admin_or_librarian(auth.uid())
);