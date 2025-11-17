
-- Créer la table editors (manquante)
CREATE TABLE IF NOT EXISTS public.editors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  google_maps_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : tous les utilisateurs authentifiés
CREATE POLICY "Les utilisateurs authentifiés peuvent voir les éditeurs"
  ON public.editors FOR SELECT
  TO authenticated
  USING (true);

-- Politique de création/modification : admins et librarians seulement
CREATE POLICY "Les admins peuvent gérer les éditeurs"
  ON public.editors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'librarian')
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_editors_updated_at
  BEFORE UPDATE ON public.editors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Créer une fonction update_updated_at_column si elle n'existe pas
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter les plans d'abonnement manquants (uniquement si ils n'existent pas)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Étudiant') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_manuscript_requests, max_downloads_per_month, has_advanced_search, has_priority_support)
    VALUES ('Étudiant', 'Accès étudiant avec tarif réduit pour la recherche académique', 9.99, 99.99, 50, 20, true, false);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Étudiant-Chercheur') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_manuscript_requests, max_downloads_per_month, has_advanced_search, has_priority_support)
    VALUES ('Étudiant-Chercheur', 'Accès combiné pour étudiants en recherche avancée', 19.99, 199.99, 100, 50, true, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE name = 'Pass Jeunes') THEN
    INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_manuscript_requests, max_downloads_per_month, has_advanced_search, has_priority_support)
    VALUES ('Pass Jeunes', 'Accès jeune public avec découverte du patrimoine', 4.99, 49.99, 20, 10, false, false);
  END IF;
END $$;

-- Créer un index sur les emails des professionnels
CREATE INDEX IF NOT EXISTS idx_editors_email ON public.editors(email);
CREATE INDEX IF NOT EXISTS idx_distributors_email ON public.distributors(email);
CREATE INDEX IF NOT EXISTS idx_printers_email ON public.printers(email);
CREATE INDEX IF NOT EXISTS idx_producers_email ON public.producers(email);

COMMENT ON TABLE public.editors IS 'Table des éditeurs (professionnels du livre)';
COMMENT ON TABLE public.subscription_plans IS 'Plans d''abonnement pour différents types d''adhérents';
