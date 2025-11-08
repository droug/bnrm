-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload their formation participant files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own formation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all formation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete formation files" ON storage.objects;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leurs fichiers
CREATE POLICY "Users can upload their formation participant files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'formations' 
  AND auth.uid() IS NOT NULL
);

-- Politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own formation files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'formations' 
  AND auth.uid() IS NOT NULL
);

-- Politique pour permettre aux admins de voir tous les fichiers
CREATE POLICY "Admins can view all formation files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'formations' 
  AND public.is_admin_or_librarian(auth.uid())
);

-- Politique pour permettre aux admins de supprimer des fichiers
CREATE POLICY "Admins can delete formation files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'formations' 
  AND public.is_admin_or_librarian(auth.uid())
);