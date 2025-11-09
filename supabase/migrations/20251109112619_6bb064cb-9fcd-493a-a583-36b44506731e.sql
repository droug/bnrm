-- Supprimer les anciennes policies problématiques
DROP POLICY IF EXISTS "Users can view their own adhesion requests" ON public.cbm_adhesions;
DROP POLICY IF EXISTS "Users can view their own formation requests" ON public.cbm_formation_requests;
DROP POLICY IF EXISTS "Authenticated users can update adhesion requests" ON public.cbm_adhesions;
DROP POLICY IF EXISTS "Authenticated users can update formation requests" ON public.cbm_formation_requests;

-- Créer des policies correctes pour cbm_adhesions
CREATE POLICY "Users can view their own adhesions or admins can view all" 
ON public.cbm_adhesions 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can update adhesion requests" 
ON public.cbm_adhesions 
FOR UPDATE 
USING (is_admin_or_librarian(auth.uid()));

-- Créer des policies correctes pour cbm_formation_requests
CREATE POLICY "Users can view their own formations or admins can view all" 
ON public.cbm_formation_requests 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can update formation requests" 
ON public.cbm_formation_requests 
FOR UPDATE 
USING (is_admin_or_librarian(auth.uid()));