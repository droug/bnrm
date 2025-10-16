-- Créer la table des éditeurs
CREATE TABLE IF NOT EXISTS public.publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  country TEXT DEFAULT 'Maroc',
  publisher_type TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut voir les éditeurs
CREATE POLICY "Everyone can view publishers"
  ON public.publishers
  FOR SELECT
  USING (true);

-- Policy: Admins peuvent gérer les éditeurs
CREATE POLICY "Admins can manage publishers"
  ON public.publishers
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policy: Utilisateurs authentifiés peuvent créer des éditeurs
CREATE POLICY "Authenticated users can create publishers"
  ON public.publishers
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Créer un index pour la recherche
CREATE INDEX IF NOT EXISTS idx_publishers_name ON public.publishers USING gin(name gin_trgm_ops);

-- Insérer les éditeurs marocains d'exemple
INSERT INTO public.publishers (name, city, country, publisher_type) VALUES
  ('Éditions La Croisée des Chemins', 'Casablanca', 'Maroc', 'Privé'),
  ('Marsam Éditions', 'Rabat', 'Maroc', 'Privé'),
  ('Éditions Le Fennec', 'Casablanca', 'Maroc', 'Privé'),
  ('Editions Afrique Orient', 'Casablanca', 'Maroc', 'Privé'),
  ('Slaiki Akhawayn', 'Tanger', 'Maroc', 'Privé'),
  ('Éditions Yomad', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions En Toutes Lettres', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions du Sirocco', 'Casablanca', 'Maroc', 'Privé'),
  ('Langages du Sud', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions Favre Maroc', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions Okad', 'Rabat', 'Maroc', 'Privé'),
  ('Centre Tarik Ibn Zyad', 'Rabat', 'Maroc', 'Institutionnel'),
  ('Éditions El Maârif Al Jadida', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions Bouregreg', 'Salé', 'Maroc', 'Privé'),
  ('Éditions Okad International', 'Rabat', 'Maroc', 'Privé'),
  ('Éditions Le Manifeste', 'Casablanca', 'Maroc', 'Privé'),
  ('Université Mohammed V Press', 'Rabat', 'Maroc', 'Institutionnel'),
  ('Éditions du Cabinet du Livre', 'Casablanca', 'Maroc', 'Privé'),
  ('Imprimerie Bouanani', 'Casablanca', 'Maroc', 'Privé'),
  ('Éditions et Imprimerie Najah El Jadida', 'Casablanca', 'Maroc', 'Privé')
ON CONFLICT DO NOTHING;