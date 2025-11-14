-- Créer un bucket pour les documents de dépôt légal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-deposit-documents',
  'legal-deposit-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
);

-- RLS Policies pour le bucket legal-deposit-documents

-- Les utilisateurs authentifiés peuvent uploader leurs propres documents
CREATE POLICY "Users can upload their own legal deposit documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'legal-deposit-documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent voir leurs propres documents
CREATE POLICY "Users can view their own legal deposit documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'legal-deposit-documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Les administrateurs et bibliothécaires peuvent voir tous les documents
CREATE POLICY "Admins and librarians can view all legal deposit documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'legal-deposit-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin'::user_role, 'librarian'::user_role)
  )
);

-- Les utilisateurs peuvent mettre à jour leurs propres documents
CREATE POLICY "Users can update their own legal deposit documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'legal-deposit-documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'legal-deposit-documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Les utilisateurs peuvent supprimer leurs propres documents (si le dépôt est en brouillon)
CREATE POLICY "Users can delete their own legal deposit documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'legal-deposit-documents' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Les admins peuvent supprimer n'importe quel document
CREATE POLICY "Admins can delete any legal deposit document"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'legal-deposit-documents' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'::user_role
  )
);