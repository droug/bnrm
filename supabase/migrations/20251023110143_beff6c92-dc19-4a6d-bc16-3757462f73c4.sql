-- Ajouter les colonnes file_url et workflow_id à la table document_templates
ALTER TABLE public.document_templates
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS workflow_id UUID;

-- Créer un bucket de stockage pour les templates si il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public) 
VALUES ('document-templates', 'document-templates', false)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour document-templates bucket - Admins peuvent uploader des templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins peuvent uploader des templates'
  ) THEN
    CREATE POLICY "Admins peuvent uploader des templates"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'document-templates' 
      AND is_admin_or_librarian(auth.uid())
    );
  END IF;
END $$;

-- Politique RLS pour document-templates bucket - Admins peuvent lire les templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins peuvent lire les templates'
  ) THEN
    CREATE POLICY "Admins peuvent lire les templates"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'document-templates'
      AND is_admin_or_librarian(auth.uid())
    );
  END IF;
END $$;

-- Politique RLS pour document-templates bucket - Admins peuvent supprimer les templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage'
    AND policyname = 'Admins peuvent supprimer les templates'
  ) THEN
    CREATE POLICY "Admins peuvent supprimer les templates"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'document-templates'
      AND is_admin_or_librarian(auth.uid())
    );
  END IF;
END $$;