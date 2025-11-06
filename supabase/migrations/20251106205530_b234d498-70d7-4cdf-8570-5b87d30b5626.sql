-- Créer un bucket pour les fichiers de demandes de formation
INSERT INTO storage.buckets (id, name, public)
VALUES ('cbm-formation-files', 'cbm-formation-files', false);

-- Politique pour permettre aux utilisateurs authentifiés d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their formation files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cbm-formation-files');

-- Politique pour permettre aux utilisateurs de voir leurs propres fichiers
CREATE POLICY "Users can view their own formation files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'cbm-formation-files');

-- Politique pour permettre aux admins de voir tous les fichiers
CREATE POLICY "Admins can view all formation files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cbm-formation-files' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

-- Ajouter une colonne pour stocker le chemin du fichier participants dans la table
ALTER TABLE cbm_demandes_formation 
ADD COLUMN fichier_participants_path TEXT;