-- Créer un bucket pour les documents de restauration
INSERT INTO storage.buckets (id, name, public)
VALUES ('restoration-documents', 'restoration-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS: Les utilisateurs peuvent uploader leurs propres documents
CREATE POLICY "Users can upload their own restoration documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restoration-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS: Les utilisateurs peuvent voir leurs propres documents
CREATE POLICY "Users can view their own restoration documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'restoration-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS: Les admins peuvent voir tous les documents
CREATE POLICY "Admins can view all restoration documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'restoration-documents' AND
  public.is_admin_or_librarian(auth.uid())
);

-- Ajouter une colonne pour stocker l'URL du devis signé
ALTER TABLE public.restoration_requests
ADD COLUMN IF NOT EXISTS signed_quote_url TEXT;