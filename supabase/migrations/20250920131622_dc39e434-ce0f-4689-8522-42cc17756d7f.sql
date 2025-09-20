-- Créer les types énumérés pour les rôles et statuts
CREATE TYPE public.user_role AS ENUM ('admin', 'librarian', 'researcher', 'visitor');
CREATE TYPE public.manuscript_status AS ENUM ('available', 'reserved', 'maintenance', 'digitization');
CREATE TYPE public.access_level AS ENUM ('public', 'restricted', 'confidential');

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  institution TEXT,
  research_field TEXT,
  phone TEXT,
  role user_role DEFAULT 'visitor',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des collections
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  curator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des manuscrits
CREATE TABLE public.manuscripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  period TEXT,
  language TEXT,
  material TEXT,
  dimensions TEXT,
  condition_notes TEXT,
  inventory_number TEXT UNIQUE,
  collection_id UUID REFERENCES public.collections(id),
  category_id UUID REFERENCES public.categories(id),
  status manuscript_status DEFAULT 'available',
  access_level access_level DEFAULT 'public',
  digital_copy_url TEXT,
  thumbnail_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des demandes d'accès
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  manuscript_id UUID REFERENCES public.manuscripts(id) NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('consultation', 'reproduction', 'research')),
  purpose TEXT NOT NULL,
  requested_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des logs d'activité
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Fonctions de sécurité
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_librarian(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid 
    AND role IN ('admin', 'librarian')
    AND is_approved = true
  );
$$;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and librarians can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin_or_librarian(auth.uid()));

CREATE POLICY "Anyone can create a profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour collections
CREATE POLICY "Everyone can view collections"
ON public.collections FOR SELECT
USING (true);

CREATE POLICY "Admins and librarians can manage collections"
ON public.collections FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour categories
CREATE POLICY "Everyone can view categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Admins and librarians can manage categories"
ON public.categories FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour manuscripts
CREATE POLICY "Everyone can view public manuscripts"
ON public.manuscripts FOR SELECT
USING (
  access_level = 'public' OR 
  public.is_admin_or_librarian(auth.uid()) OR
  (access_level = 'restricted' AND auth.uid() IS NOT NULL)
);

CREATE POLICY "Admins and librarians can manage manuscripts"
ON public.manuscripts FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour access_requests
CREATE POLICY "Users can view their own requests"
ON public.access_requests FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = access_requests.user_id AND user_id = auth.uid()) OR
  public.is_admin_or_librarian(auth.uid())
);

CREATE POLICY "Authenticated users can create requests"
ON public.access_requests FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = access_requests.user_id AND user_id = auth.uid())
);

CREATE POLICY "Admins and librarians can manage requests"
ON public.access_requests FOR ALL
USING (public.is_admin_or_librarian(auth.uid()));

-- Politiques RLS pour activity_logs
CREATE POLICY "Admins can view all logs"
ON public.activity_logs FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "System can insert logs"
ON public.activity_logs FOR INSERT
WITH CHECK (true);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
BEFORE UPDATE ON public.collections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manuscripts_updated_at
BEFORE UPDATE ON public.manuscripts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_access_requests_updated_at
BEFORE UPDATE ON public.access_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'visitor'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Données de test
INSERT INTO public.categories (name, description) VALUES
('Manuscrits arabes', 'Collection de manuscrits en langue arabe'),
('Manuscrits amazighs', 'Collection de manuscrits en langues amazighes'),
('Archives historiques', 'Documents historiques et administratifs'),
('Cartes et plans', 'Cartographie historique du Maroc');

INSERT INTO public.collections (name, description) VALUES
('Collection Hassania', 'Manuscrits de la période hassanienne'),
('Fonds Alaouite', 'Documents de la dynastie alaouite'),
('Archives du Protectorat', 'Documents de la période du protectorat français');