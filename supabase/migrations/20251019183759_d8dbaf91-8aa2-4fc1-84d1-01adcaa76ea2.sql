-- Créer la table distributors
CREATE TABLE public.distributors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les distributeurs
CREATE POLICY "Everyone can view distributors" 
ON public.distributors 
FOR SELECT 
USING (true);

-- Politique pour que les utilisateurs authentifiés puissent créer des distributeurs
CREATE POLICY "Authenticated users can create distributors" 
ON public.distributors 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Politique pour que les admins puissent gérer les distributeurs
CREATE POLICY "Admins can manage distributors" 
ON public.distributors 
FOR ALL 
USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_distributors_updated_at
  BEFORE UPDATE ON public.distributors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques exemples de distributeurs
INSERT INTO public.distributors (name, address, phone, email) VALUES
  ('Distribution du Livre Marocain', 'Avenue Mohammed V, Rabat', '+212 5 37 12 34 56', 'contact@dlm.ma'),
  ('La Caravane du Livre', 'Boulevard Zerktouni, Casablanca', '+212 5 22 45 67 89', 'info@caravane-livre.ma'),
  ('Dar Nachr Al Maarifa', 'Quartier Industriel, Fès', '+212 5 35 78 90 12', 'contact@dnm.ma'),
  ('Librairie Papeterie Nationale', 'Rue des Consuls, Rabat', '+212 5 37 23 45 67', 'lpn@menara.ma'),
  ('Sochepress Distribution', 'Zone Industrielle Oukacha, Casablanca', '+212 5 22 34 56 78', 'contact@sochepress.ma');