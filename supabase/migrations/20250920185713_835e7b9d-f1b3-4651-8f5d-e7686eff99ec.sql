-- Create permissions table for granular permission management
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Create user_permissions table for individual overrides
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL,
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);

-- Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions
CREATE POLICY "Everyone can view permissions" ON public.permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for role_permissions
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Insert default permissions
INSERT INTO public.permissions (name, category, description) VALUES
  -- Manuscript Management
  ('manuscripts.view.public', 'manuscripts', 'Voir les manuscrits publics'),
  ('manuscripts.view.restricted', 'manuscripts', 'Voir les manuscrits restreints'),
  ('manuscripts.view.all', 'manuscripts', 'Voir tous les manuscrits'),
  ('manuscripts.create', 'manuscripts', 'Créer des manuscrits'),
  ('manuscripts.edit', 'manuscripts', 'Modifier des manuscrits'),
  ('manuscripts.delete', 'manuscripts', 'Supprimer des manuscrits'),
  ('manuscripts.download', 'manuscripts', 'Télécharger des manuscrits'),
  
  -- User Management
  ('users.view', 'users', 'Voir les utilisateurs'),
  ('users.create', 'users', 'Créer des utilisateurs'),
  ('users.edit', 'users', 'Modifier les utilisateurs'),
  ('users.delete', 'users', 'Supprimer les utilisateurs'),
  ('users.approve', 'users', 'Approuver les utilisateurs'),
  ('users.roles.assign', 'users', 'Assigner des rôles'),
  
  -- Request Management
  ('requests.create', 'requests', 'Créer des demandes'),
  ('requests.view.own', 'requests', 'Voir ses propres demandes'),
  ('requests.view.all', 'requests', 'Voir toutes les demandes'),
  ('requests.approve', 'requests', 'Approuver les demandes'),
  ('requests.reject', 'requests', 'Rejeter les demandes'),
  
  -- Collection Management
  ('collections.view', 'collections', 'Voir les collections'),
  ('collections.create', 'collections', 'Créer des collections'),
  ('collections.edit', 'collections', 'Modifier des collections'),
  ('collections.delete', 'collections', 'Supprimer des collections'),
  
  -- System Administration
  ('system.analytics', 'system', 'Voir les analyses système'),
  ('system.logs', 'system', 'Voir les logs système'),
  ('system.permissions', 'system', 'Gérer les permissions'),
  ('system.backup', 'system', 'Gérer les sauvegardes'),
  
  -- Subscription Management
  ('subscriptions.view', 'subscriptions', 'Voir les abonnements'),
  ('subscriptions.manage', 'subscriptions', 'Gérer les abonnements'),
  ('subscriptions.plans', 'subscriptions', 'Gérer les plans d''abonnement');

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'admin'::user_role, id, true FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'librarian'::user_role, id, true FROM public.permissions 
WHERE category IN ('manuscripts', 'collections', 'requests') OR name = 'users.view';

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'researcher'::user_role, id, true FROM public.permissions 
WHERE name IN ('manuscripts.view.public', 'manuscripts.view.restricted', 'manuscripts.download', 'requests.create', 'requests.view.own', 'collections.view');

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'partner'::user_role, id, true FROM public.permissions 
WHERE name IN ('manuscripts.view.public', 'manuscripts.view.restricted', 'manuscripts.download', 'requests.create', 'requests.view.own', 'collections.view');

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'subscriber'::user_role, id, true FROM public.permissions 
WHERE name IN ('manuscripts.view.public', 'manuscripts.view.restricted', 'manuscripts.download', 'requests.create', 'requests.view.own', 'collections.view');

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'public_user'::user_role, id, true FROM public.permissions 
WHERE name IN ('manuscripts.view.public', 'requests.create', 'requests.view.own', 'collections.view');

INSERT INTO public.role_permissions (role, permission_id, granted) 
SELECT 'visitor'::user_role, id, true FROM public.permissions 
WHERE name IN ('manuscripts.view.public', 'collections.view');

-- Create comprehensive permission check function
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_profile AS (
    SELECT role, is_approved 
    FROM profiles 
    WHERE user_id = user_uuid
  ),
  permission_check AS (
    SELECT p.id as permission_id
    FROM permissions p
    WHERE p.name = permission_name
  ),
  -- Check role-based permissions
  role_permission AS (
    SELECT rp.granted
    FROM role_permissions rp
    JOIN permission_check pc ON rp.permission_id = pc.permission_id
    JOIN user_profile up ON rp.role = up.role
  ),
  -- Check individual user permission overrides
  user_override AS (
    SELECT up.granted
    FROM user_permissions up
    JOIN permission_check pc ON up.permission_id = pc.permission_id
    WHERE up.user_id = user_uuid 
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
  SELECT COALESCE(
    (SELECT granted FROM user_override),
    (SELECT granted FROM role_permission),
    false
  ) AND COALESCE((SELECT is_approved FROM user_profile), false);
$$;

-- Create function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS JSONB
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_profile AS (
    SELECT role, is_approved 
    FROM profiles 
    WHERE user_id = user_uuid
  ),
  role_perms AS (
    SELECT p.name, p.category, rp.granted
    FROM permissions p
    JOIN role_permissions rp ON p.id = rp.permission_id
    JOIN user_profile up ON rp.role = up.role
  ),
  user_overrides AS (
    SELECT p.name, p.category, up.granted, up.expires_at
    FROM permissions p
    JOIN user_permissions up ON p.id = up.permission_id
    WHERE up.user_id = user_uuid
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  ),
  final_permissions AS (
    SELECT 
      COALESCE(uo.name, rp.name) as name,
      COALESCE(uo.category, rp.category) as category,
      COALESCE(uo.granted, rp.granted) as granted,
      uo.expires_at
    FROM role_perms rp
    FULL OUTER JOIN user_overrides uo ON rp.name = uo.name
  )
  SELECT jsonb_object_agg(
    name, 
    jsonb_build_object(
      'granted', granted AND COALESCE((SELECT is_approved FROM user_profile), false),
      'category', category,
      'expires_at', expires_at
    )
  )
  FROM final_permissions
  WHERE granted = true;
$$;

-- Create trigger for user_permissions updated_at
CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON public.user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();