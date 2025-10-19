-- Créer la table producers si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- Policy pour que tout le monde puisse voir les producteurs
CREATE POLICY "Everyone can view producers"
ON public.producers
FOR SELECT
USING (true);

-- Policy pour que les admins puissent gérer les producteurs
CREATE POLICY "Admins can manage producers"
ON public.producers
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Policy pour que les utilisateurs authentifiés puissent créer des producteurs
CREATE POLICY "Authenticated users can create producers"
ON public.producers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Insérer des données de test
INSERT INTO public.producers (name, address, phone, email) VALUES
('Productions Atlas', 'Avenue Hassan II, Casablanca', '+212 522 123456', 'contact@atlas.ma'),
('Maghreb Digital', 'Boulevard Mohammed V, Rabat', '+212 537 654321', 'info@maghrebdigital.ma'),
('TechnoMaroc Productions', 'Rue de la Liberté, Marrakech', '+212 524 987654', 'contact@technomaroc.ma'),
('Sahara Media Group', 'Zone Industrielle, Tanger', '+212 539 111222', 'info@saharamedia.ma'),
('Digital Solutions Maroc', 'Quartier des Affaires, Agadir', '+212 528 333444', 'contact@digitalsolutions.ma'),
('Nord Productions', 'Avenue des FAR, Tétouan', '+212 539 555666', 'info@nordprod.ma'),
('Orient Multimédia', 'Boulevard Hassan I, Oujda', '+212 536 777888', 'contact@orientmedia.ma'),
('Sud Productions', 'Avenue Mohammed VI, Laâyoune', '+212 528 999000', 'info@sudprod.ma'),
('Centre Productions', 'Rue Allal Ben Abdellah, Fès', '+212 535 121314', 'contact@centreprod.ma'),
('Productions Océan', 'Corniche Ain Diab, Casablanca', '+212 522 151617', 'info@ocean.ma'),
('Rif Multimédia', 'Avenue Mohammed V, Al Hoceima', '+212 539 181920', 'contact@rifmedia.ma'),
('Atlas Digital Studios', 'Zone Industrielle Sidi Maarouf, Casablanca', '+212 522 212223', 'studios@atlasdigital.ma'),
('Productions Impériales', 'Médina, Meknès', '+212 535 242526', 'info@imperiales.ma'),
('Désert Productions', 'Route Erfoud, Merzouga', '+212 535 272829', 'contact@desertprod.ma'),
('Atlantique Studios', 'Essaouira Marina', '+212 524 303132', 'info@atlantique.ma');

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_producers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_producers_updated_at
BEFORE UPDATE ON public.producers
FOR EACH ROW
EXECUTE FUNCTION public.update_producers_updated_at();