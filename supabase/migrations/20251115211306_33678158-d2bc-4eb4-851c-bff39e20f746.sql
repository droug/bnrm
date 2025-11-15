-- Table pour les modules système
CREATE TABLE IF NOT EXISTS public.system_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les services système
CREATE TABLE IF NOT EXISTS public.system_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  module_id UUID REFERENCES public.system_modules(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_system_modules_platform ON public.system_modules(platform);
CREATE INDEX IF NOT EXISTS idx_system_modules_is_active ON public.system_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_system_services_module_id ON public.system_services(module_id);
CREATE INDEX IF NOT EXISTS idx_system_services_is_active ON public.system_services(is_active);

-- Activer RLS
ALTER TABLE public.system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_services ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : tout le monde peut lire, seuls les admins peuvent modifier
CREATE POLICY "Tout le monde peut lire les modules"
  ON public.system_modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les modules"
  ON public.system_modules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tout le monde peut lire les services"
  ON public.system_services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent gérer les services"
  ON public.system_services FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_system_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_system_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_system_modules_updated_at
  BEFORE UPDATE ON public.system_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_modules_updated_at();

CREATE TRIGGER update_system_services_updated_at
  BEFORE UPDATE ON public.system_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_system_services_updated_at();