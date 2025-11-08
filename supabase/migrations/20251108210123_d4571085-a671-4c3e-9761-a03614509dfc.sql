-- Supprimer toutes les anciennes politiques du bucket formations
DROP POLICY IF EXISTS "Users can upload their formation participant files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own formation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all formation files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete formation files" ON storage.objects;

-- Politique pour permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Allow authenticated uploads to formations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'formations'
);

-- Politique pour permettre aux utilisateurs authentifiés de télécharger
CREATE POLICY "Allow authenticated downloads from formations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'formations'
);

-- Politique pour permettre aux admins de supprimer
CREATE POLICY "Allow admins to delete formations files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'formations' 
  AND public.is_admin_or_librarian(auth.uid())
);

-- Politique pour permettre la mise à jour
CREATE POLICY "Allow authenticated updates to formations"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'formations'
);