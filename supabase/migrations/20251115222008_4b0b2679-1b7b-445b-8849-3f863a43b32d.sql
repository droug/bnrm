-- ============================================
-- MIGRATION: Rôles dynamiques (corrigée)
-- ============================================

-- ÉTAPE 1: Créer table system_roles
CREATE TABLE IF NOT EXISTS public.system_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code TEXT NOT NULL UNIQUE,
  role_name TEXT NOT NULL,
  role_category TEXT NOT NULL CHECK (role_category IN ('administration', 'user', 'professional', 'internal')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_roles_code ON public.system_roles(role_code);
CREATE INDEX IF NOT EXISTS idx_system_roles_active ON public.system_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_system_roles_category ON public.system_roles(role_category);

-- ÉTAPE 2: Insérer les 15 rôles
INSERT INTO public.system_roles (role_code, role_name, role_category, description, permissions, limits) VALUES
  ('librarian', 'Bibliothécaire', 'administration', 'Gestion bibliothèque et catalogues', '["catalog.manage", "manuscripts.view", "digital_library.manage"]', '{"maxRequests": 999, "maxDownloadsPerDay": 999, "canDownload": true, "canRequestReproduction": true, "priorityProcessing": true, "advancedSearch": true}'),
  ('direction', 'Direction', 'administration', 'Direction BNRM', '["approve.all", "view.all"]', '{"maxRequests": 999, "maxDownloadsPerDay": 999, "canDownload": true}'),
  ('dac', 'DAC', 'administration', 'Direction Affaires Culturelles', '["cultural.validate", "events.manage"]', '{"maxRequests": 999, "maxDownloadsPerDay": 999, "canDownload": true}'),
  ('comptable', 'Comptable', 'administration', 'Gestion financière', '["finance.manage", "payments.view"]', '{"maxRequests": 999, "maxDownloadsPerDay": 999}'),
  ('visitor', 'Visiteur', 'user', 'Accès public limité', '["public.view"]', '{"maxRequests": 5, "maxDownloadsPerDay": 0, "canDownload": false, "canRequestReproduction": false, "priorityProcessing": false, "advancedSearch": false}'),
  ('public_user', 'Grand Public', 'user', 'Utilisateur inscrit', '["public.view", "restricted.request"]', '{"maxRequests": 20, "maxDownloadsPerDay": 0, "canDownload": false, "canRequestReproduction": false, "priorityProcessing": false, "advancedSearch": false}'),
  ('subscriber', 'Abonné Premium', 'user', 'Abonnement premium', '["public.view", "restricted.view", "download.limited"]', '{"maxRequests": 100, "maxDownloadsPerDay": 10, "canDownload": true, "canRequestReproduction": true, "priorityProcessing": false, "advancedSearch": true}'),
  ('researcher', 'Chercheur', 'user', 'Chercheur académique', '["public.view", "restricted.view", "reproduction.request", "advanced_search"]', '{"maxRequests": 50, "maxDownloadsPerDay": 20, "canDownload": true, "canRequestReproduction": true, "priorityProcessing": false, "advancedSearch": true}'),
  ('partner', 'Partenaire', 'user', 'Institution partenaire', '["public.view", "restricted.view", "reproduction.request", "priority_processing"]', '{"maxRequests": 200, "maxDownloadsPerDay": 50, "canDownload": true, "canRequestReproduction": true, "priorityProcessing": true, "advancedSearch": true}'),
  ('author', 'Auteur', 'professional', 'Auteur/Écrivain', '["legal_deposit.submit", "manuscripts.submit"]', '{"maxRequests": 100, "maxDownloadsPerDay": 0}'),
  ('editor', 'Éditeur', 'professional', 'Maison édition', '["legal_deposit.submit", "isbn.request"]', '{"maxRequests": 100, "maxDownloadsPerDay": 0}'),
  ('printer', 'Imprimeur', 'professional', 'Imprimerie', '["legal_deposit.submit", "production.manage"]', '{"maxRequests": 100, "maxDownloadsPerDay": 0}'),
  ('producer', 'Producteur', 'professional', 'Producteur contenus', '["legal_deposit.submit", "content.manage"]', '{"maxRequests": 100, "maxDownloadsPerDay": 0}'),
  ('distributor', 'Distributeur', 'professional', 'Distributeur livres', '["distribution.manage", "catalog.view"]', '{"maxRequests": 100, "maxDownloadsPerDay": 0}'),
  ('read_only', 'Lecture Seule', 'internal', 'Lecture seule', '["view.limited"]', '{"maxRequests": 50, "maxDownloadsPerDay": 0}')
ON CONFLICT (role_code) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  limits = EXCLUDED.limits,
  updated_at = NOW();

-- ÉTAPE 3: Table user_system_roles
CREATE TABLE IF NOT EXISTS public.user_system_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.system_roles(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_system_roles_user ON public.user_system_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_role ON public.user_system_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_active ON public.user_system_roles(is_active, expires_at);

-- ÉTAPE 4: Migrer données
INSERT INTO public.user_system_roles (user_id, role_id, granted_by, granted_at, expires_at, is_active)
SELECT 
  ur.user_id,
  sr.id,
  ur.granted_by,
  ur.granted_at,
  ur.expires_at,
  true
FROM public.user_roles ur
INNER JOIN public.system_roles sr ON sr.role_code = ur.role::text
WHERE ur.role != 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ÉTAPE 5: Fonction has_system_role
CREATE OR REPLACE FUNCTION public.has_system_role(_user_id UUID, _role_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _role_code = 'admin' THEN 
      EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = _user_id 
        AND role = 'admin'
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    ELSE 
      EXISTS (
        SELECT 1 FROM user_system_roles usr
        INNER JOIN system_roles sr ON sr.id = usr.role_id
        WHERE usr.user_id = _user_id 
        AND sr.role_code = _role_code
        AND sr.is_active = true
        AND usr.is_active = true
        AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
      )
  END;
$$;

-- ÉTAPE 6: Fonction get_user_all_system_roles (sans ORDER BY problématique)
CREATE OR REPLACE FUNCTION public.get_user_all_system_roles(_user_id UUID)
RETURNS TABLE (
  role_id TEXT,
  role_code TEXT,
  role_name TEXT,
  role_category TEXT,
  granted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  -- Admin
  SELECT 
    ur.id::TEXT,
    'admin'::TEXT,
    'Administrateur'::TEXT,
    'administration'::TEXT,
    ur.granted_at,
    ur.expires_at
  FROM user_roles ur
  WHERE ur.user_id = _user_id 
  AND ur.role = 'admin'
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  
  UNION ALL
  
  -- Autres rôles
  SELECT 
    usr.id::TEXT,
    sr.role_code,
    sr.role_name,
    sr.role_category,
    usr.granted_at,
    usr.expires_at
  FROM user_system_roles usr
  INNER JOIN system_roles sr ON sr.id = usr.role_id
  WHERE usr.user_id = _user_id
  AND sr.is_active = true
  AND usr.is_active = true
  AND (usr.expires_at IS NULL OR usr.expires_at > NOW())
  ORDER BY 
    CASE 
      WHEN role_category = 'administration' THEN 1
      WHEN role_category = 'professional' THEN 2
      WHEN role_category = 'user' THEN 3
      ELSE 4
    END;
END;
$$;

-- ÉTAPE 7: RLS system_roles
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tout le monde peut voir les rôles actifs" ON public.system_roles;
CREATE POLICY "Tout le monde peut voir les rôles actifs"
ON public.system_roles FOR SELECT
TO authenticated
USING (is_active = true);

DROP POLICY IF EXISTS "Admins peuvent gérer les rôles" ON public.system_roles;
CREATE POLICY "Admins peuvent gérer les rôles"
ON public.system_roles FOR ALL
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

-- ÉTAPE 8: RLS user_system_roles
ALTER TABLE public.user_system_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utilisateurs voient leurs rôles" ON public.user_system_roles;
CREATE POLICY "Utilisateurs voient leurs rôles"
ON public.user_system_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Admins attribuent rôles" ON public.user_system_roles;
CREATE POLICY "Admins attribuent rôles"
ON public.user_system_roles FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Admins modifient rôles" ON public.user_system_roles;
CREATE POLICY "Admins modifient rôles"
ON public.user_system_roles FOR UPDATE
TO authenticated
USING (is_admin_or_librarian(auth.uid()))
WITH CHECK (is_admin_or_librarian(auth.uid()));

DROP POLICY IF EXISTS "Admins révoquent rôles" ON public.user_system_roles;
CREATE POLICY "Admins révoquent rôles"
ON public.user_system_roles FOR DELETE
TO authenticated
USING (is_admin_or_librarian(auth.uid()));

-- ÉTAPE 9: Trigger
CREATE OR REPLACE FUNCTION public.update_system_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_system_roles_updated_at ON public.system_roles;
CREATE TRIGGER trigger_update_system_roles_updated_at
BEFORE UPDATE ON public.system_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_system_roles_updated_at();