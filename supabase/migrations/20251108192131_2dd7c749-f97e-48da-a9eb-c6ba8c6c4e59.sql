
-- Ajouter des politiques RLS pour permettre aux administrateurs de voir toutes les adhésions

-- Pour cbm_adhesions_catalogue
CREATE POLICY "Admins can view all catalogue adhesions"
ON public.cbm_adhesions_catalogue
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = auth.uid()
    AND p.name IN ('system.admin', 'users.manage', 'content.manage')
    AND up.granted = true
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
);

CREATE POLICY "Admins can update all catalogue adhesions"
ON public.cbm_adhesions_catalogue
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = auth.uid()
    AND p.name IN ('system.admin', 'users.manage', 'content.manage')
    AND up.granted = true
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
);

-- Pour cbm_adhesions_reseau
CREATE POLICY "Admins can view all reseau adhesions"
ON public.cbm_adhesions_reseau
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = auth.uid()
    AND p.name IN ('system.admin', 'users.manage', 'content.manage')
    AND up.granted = true
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
);

CREATE POLICY "Admins can update all reseau adhesions"
ON public.cbm_adhesions_reseau
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_permissions up
    JOIN public.permissions p ON p.id = up.permission_id
    WHERE up.user_id = auth.uid()
    AND p.name IN ('system.admin', 'users.manage', 'content.manage')
    AND up.granted = true
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
);
