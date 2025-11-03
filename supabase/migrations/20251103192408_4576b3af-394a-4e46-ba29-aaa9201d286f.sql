
-- Rendre le bucket restoration-documents public pour permettre l'accès aux fichiers
UPDATE storage.buckets 
SET public = true 
WHERE id = 'restoration-documents';

-- Ajouter une politique pour permettre les mises à jour (UPDATE) des fichiers
-- Cela permet aux utilisateurs de remplacer leur devis signé si nécessaire
CREATE POLICY "Users can update their own restoration documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'restoration-documents' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'restoration-documents' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Ajouter une politique pour permettre la suppression des fichiers
CREATE POLICY "Users can delete their own restoration documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'restoration-documents' 
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
