-- Créer le bucket documents s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  10485760, -- 10 MB en octets
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tous de télécharger des fichiers dans le dossier program-contributions
CREATE POLICY "Allow authenticated users to upload program contributions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'program-contributions'
);

-- Politique pour permettre la lecture publique des fichiers program-contributions
CREATE POLICY "Allow public read access to program contributions"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'program-contributions'
);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs fichiers
CREATE POLICY "Allow authenticated users to update program contributions"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'program-contributions'
);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs fichiers
CREATE POLICY "Allow authenticated users to delete program contributions"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = 'program-contributions'
);