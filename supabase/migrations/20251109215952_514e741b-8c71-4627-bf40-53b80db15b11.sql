-- Supprimer toutes les politiques existantes sur reservations_requests
DROP POLICY IF EXISTS "Users can view their own reservation requests" ON public.reservations_requests;
DROP POLICY IF EXISTS "Users can insert their own reservation requests" ON public.reservations_requests;
DROP POLICY IF EXISTS "Admins and librarians can view all reservation requests" ON public.reservations_requests;
DROP POLICY IF EXISTS "Admins and librarians can update all reservation requests" ON public.reservations_requests;
DROP POLICY IF EXISTS "Admins can delete reservation requests" ON public.reservations_requests;

-- Recréer les politiques

-- Politique pour permettre à un utilisateur authentifié d'insérer ses propres demandes
CREATE POLICY "Users can insert their own reservation requests"
ON public.reservations_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de voir leurs propres demandes
CREATE POLICY "Users can view their own reservation requests"
ON public.reservations_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux admins et bibliothécaires de voir toutes les demandes
CREATE POLICY "Admins and librarians can view all reservation requests"
ON public.reservations_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux admins et bibliothécaires de modifier toutes les demandes
CREATE POLICY "Admins and librarians can update all reservation requests"
ON public.reservations_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Politique pour permettre aux admins de supprimer les demandes
CREATE POLICY "Admins can delete reservation requests"
ON public.reservations_requests
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);