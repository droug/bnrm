-- Table pour stocker les restrictions d'accès aux pages des ouvrages
CREATE TABLE IF NOT EXISTS public.page_access_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  is_restricted BOOLEAN DEFAULT false,
  restriction_mode TEXT CHECK (restriction_mode IN ('range', 'manual')) DEFAULT 'range',
  start_page INTEGER DEFAULT 1,
  end_page INTEGER DEFAULT 10,
  manual_pages INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(content_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_page_restrictions_content ON public.page_access_restrictions(content_id);
CREATE INDEX IF NOT EXISTS idx_page_restrictions_restricted ON public.page_access_restrictions(is_restricted);

-- Activer RLS
ALTER TABLE public.page_access_restrictions ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les restrictions (pour vérifier l'accès)
CREATE POLICY "Restrictions are viewable by everyone"
ON public.page_access_restrictions
FOR SELECT
USING (true);

-- Politique : Seuls les admins et bibliothécaires peuvent créer
CREATE POLICY "Admins and librarians can create restrictions"
ON public.page_access_restrictions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Politique : Seuls les admins et bibliothécaires peuvent modifier
CREATE POLICY "Admins and librarians can update restrictions"
ON public.page_access_restrictions
FOR UPDATE
TO authenticated
USING (public.is_admin_or_librarian(auth.uid()))
WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Politique : Seuls les admins et bibliothécaires peuvent supprimer
CREATE POLICY "Admins and librarians can delete restrictions"
ON public.page_access_restrictions
FOR DELETE
TO authenticated
USING (public.is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_page_restrictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_restrictions_updated_at
BEFORE UPDATE ON public.page_access_restrictions
FOR EACH ROW
EXECUTE FUNCTION public.update_page_restrictions_updated_at();