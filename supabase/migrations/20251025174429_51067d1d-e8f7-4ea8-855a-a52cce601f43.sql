-- Table pour la gestion des collections/manuscrits
CREATE TABLE IF NOT EXISTS public.cote_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  nom_arabe TEXT NOT NULL,
  nom_francais TEXT NOT NULL,
  type_collection TEXT NOT NULL CHECK (type_collection IN ('Manuscrit', 'Document', 'Photo', 'Autre')),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les abréviations de villes
CREATE TABLE IF NOT EXISTS public.cote_villes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_arabe TEXT NOT NULL,
  nom_francais TEXT NOT NULL,
  abreviation TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les nomenclatures de fichiers
CREATE TABLE IF NOT EXISTS public.cote_nomenclatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefixe TEXT NOT NULL,
  modele_codification TEXT NOT NULL,
  description TEXT,
  module_concerne TEXT NOT NULL CHECK (module_concerne IN ('Manuscrits', 'Activités culturelles', 'Prix Hassan II', 'Autres')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cote_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cote_villes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cote_nomenclatures ENABLE ROW LEVEL SECURITY;

-- Policies pour cote_collections
CREATE POLICY "Admins peuvent gérer les collections"
  ON public.cote_collections
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Tout le monde peut voir les collections"
  ON public.cote_collections
  FOR SELECT
  USING (true);

-- Policies pour cote_villes
CREATE POLICY "Admins peuvent gérer les villes"
  ON public.cote_villes
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Tout le monde peut voir les villes"
  ON public.cote_villes
  FOR SELECT
  USING (true);

-- Policies pour cote_nomenclatures
CREATE POLICY "Admins peuvent gérer les nomenclatures"
  ON public.cote_nomenclatures
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Tout le monde peut voir les nomenclatures actives"
  ON public.cote_nomenclatures
  FOR SELECT
  USING (is_active = true OR is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cote_collections_updated_at BEFORE UPDATE ON public.cote_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cote_villes_updated_at BEFORE UPDATE ON public.cote_villes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cote_nomenclatures_updated_at BEFORE UPDATE ON public.cote_nomenclatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();