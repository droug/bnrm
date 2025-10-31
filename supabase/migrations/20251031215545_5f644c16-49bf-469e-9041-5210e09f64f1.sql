-- Créer les politiques RLS pour la table page_access_restrictions

-- Politique pour permettre aux admins et librarians de voir toutes les restrictions
CREATE POLICY "Admins and librarians can view all page restrictions"
ON page_access_restrictions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux admins et librarians de créer des restrictions
CREATE POLICY "Admins and librarians can create page restrictions"
ON page_access_restrictions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux admins et librarians de mettre à jour des restrictions
CREATE POLICY "Admins and librarians can update page restrictions"
ON page_access_restrictions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux admins et librarians de supprimer des restrictions
CREATE POLICY "Admins and librarians can delete page restrictions"
ON page_access_restrictions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux utilisateurs authentifiés de voir les restrictions des documents auxquels ils ont accès
CREATE POLICY "Authenticated users can view page restrictions"
ON page_access_restrictions
FOR SELECT
TO authenticated
USING (true);