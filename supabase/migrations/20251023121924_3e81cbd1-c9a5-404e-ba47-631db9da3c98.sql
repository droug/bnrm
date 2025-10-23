-- Créer la table pour les catégories générales
CREATE TABLE IF NOT EXISTS public.bnrm_categories_generales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_categories_generales_code ON public.bnrm_categories_generales(code);
CREATE INDEX IF NOT EXISTS idx_categories_generales_libelle ON public.bnrm_categories_generales(libelle);

-- Activer RLS
ALTER TABLE public.bnrm_categories_generales ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read categories"
  ON public.bnrm_categories_generales
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique d'insertion pour les utilisateurs autorisés
CREATE POLICY "Authorized users can insert categories"
  ON public.bnrm_categories_generales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.workflow_user_roles wur
      JOIN public.workflow_roles wr ON wur.workflow_role_id = wr.id
      WHERE wur.user_id = auth.uid() 
        AND wur.is_active = true
        AND wr.role_name IN ('Direction', 'DAC', 'Bureau d''ordre')
    )
  );

-- Politique de mise à jour pour les utilisateurs autorisés
CREATE POLICY "Authorized users can update categories"
  ON public.bnrm_categories_generales
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.workflow_user_roles wur
      JOIN public.workflow_roles wr ON wur.workflow_role_id = wr.id
      WHERE wur.user_id = auth.uid() 
        AND wur.is_active = true
        AND wr.role_name IN ('Direction', 'DAC', 'Bureau d''ordre')
    )
  );

-- Politique de suppression pour les utilisateurs autorisés
CREATE POLICY "Authorized users can delete categories"
  ON public.bnrm_categories_generales
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.workflow_user_roles wur
      JOIN public.workflow_roles wr ON wur.workflow_role_id = wr.id
      WHERE wur.user_id = auth.uid() 
        AND wur.is_active = true
        AND wr.role_name IN ('Direction', 'DAC')
    )
  );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_bnrm_categories_generales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bnrm_categories_generales_updated_at
  BEFORE UPDATE ON public.bnrm_categories_generales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bnrm_categories_generales_updated_at();