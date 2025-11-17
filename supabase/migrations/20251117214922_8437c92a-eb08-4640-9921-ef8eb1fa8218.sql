-- RLS policies pour la table cms_media
-- Permettre à tout le monde de voir les médias (lecture publique)
CREATE POLICY "Tout le monde peut voir les médias"
ON cms_media FOR SELECT
TO public
USING (true);

-- Permettre aux admins et bibliothécaires de créer des médias
CREATE POLICY "Admins et bibliothécaires peuvent créer des médias"
ON cms_media FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);

-- Permettre aux admins et bibliothécaires de modifier des médias
CREATE POLICY "Admins et bibliothécaires peuvent modifier des médias"
ON cms_media FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);

-- Permettre aux admins et bibliothécaires de supprimer des médias
CREATE POLICY "Admins et bibliothécaires peuvent supprimer des médias"
ON cms_media FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'librarian')
  )
);