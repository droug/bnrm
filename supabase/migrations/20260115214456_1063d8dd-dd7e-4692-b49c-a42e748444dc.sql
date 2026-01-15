-- Table pour gérer les œuvres vedettes du carousel de la bibliothèque numérique
CREATE TABLE public.digital_library_featured_works (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.digital_library_documents(id) ON DELETE CASCADE,
  -- Champs pour les œuvres manuelles (sans document associé)
  custom_title TEXT,
  custom_title_ar TEXT,
  custom_author TEXT,
  custom_image_url TEXT,
  custom_category TEXT,
  custom_date TEXT,
  custom_description TEXT,
  custom_link TEXT,
  -- Paramètres d'affichage
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Index pour l'ordre d'affichage
CREATE INDEX idx_featured_works_order ON public.digital_library_featured_works(display_order) WHERE is_active = true;

-- Activer RLS
ALTER TABLE public.digital_library_featured_works ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Les œuvres vedettes sont visibles publiquement" 
ON public.digital_library_featured_works 
FOR SELECT 
USING (is_active = true);

-- Politique d'écriture pour les admins et bibliothécaires (via user_roles)
CREATE POLICY "Les admins peuvent gérer les œuvres vedettes" 
ON public.digital_library_featured_works 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
  )
);

-- Trigger pour updated_at
CREATE TRIGGER update_featured_works_updated_at
BEFORE UPDATE ON public.digital_library_featured_works
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.digital_library_featured_works IS 'Œuvres vedettes configurables pour le carousel de la bibliothèque numérique';
COMMENT ON COLUMN public.digital_library_featured_works.document_id IS 'Référence optionnelle vers un document de la bibliothèque numérique';
COMMENT ON COLUMN public.digital_library_featured_works.custom_title IS 'Titre personnalisé (utilisé si document_id est null)';
COMMENT ON COLUMN public.digital_library_featured_works.display_order IS 'Ordre d''affichage dans le carousel';