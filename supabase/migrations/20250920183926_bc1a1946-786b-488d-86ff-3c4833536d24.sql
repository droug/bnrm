-- Mettre à jour l'enum user_role pour inclure les nouveaux profils différenciés
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'public_user';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'subscriber'; 
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';

-- Renommer 'visitor' en 'public_user' pour plus de clarté (optionnel)
-- Note: En production, il faudrait migrer les données existantes

-- Ajouter de nouveaux champs pour les profils différenciés
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_type text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_organization text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS research_specialization text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS access_level_details jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_preferences jsonb DEFAULT '{}';

-- Créer une table pour les types d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric(10,2),
  price_yearly numeric(10,2),
  max_manuscript_requests integer,
  max_downloads_per_month integer,
  has_advanced_search boolean DEFAULT false,
  has_priority_support boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS sur la nouvelle table
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les plans d'abonnement
CREATE POLICY "Everyone can view subscription plans"
ON subscription_plans FOR SELECT
USING (true);

-- Seuls les admins peuvent gérer les plans
CREATE POLICY "Admins can manage subscription plans"
ON subscription_plans FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Insérer des plans d'abonnement par défaut
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, max_manuscript_requests, max_downloads_per_month, has_advanced_search, has_priority_support) VALUES
('Gratuit', 'Accès de base aux manuscrits publics', 0, 0, 5, 10, false, false),
('Chercheur', 'Accès étendu pour la recherche académique', 29.99, 299.99, 50, 100, true, true),
('Institution', 'Accès complet pour les institutions partenaires', 199.99, 1999.99, 999, 999, true, true),
('Premium', 'Accès illimité avec services prioritaires', 79.99, 799.99, 999, 999, true, true);

-- Créer une fonction pour obtenir les permissions selon le profil
CREATE OR REPLACE FUNCTION get_profile_permissions(user_uuid uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN p.role = 'admin' THEN 
        '{"can_manage_users": true, "can_manage_manuscripts": true, "can_approve_requests": true, "max_requests": 999, "access_level": "full"}'::jsonb
      WHEN p.role = 'librarian' THEN 
        '{"can_manage_manuscripts": true, "can_approve_requests": true, "max_requests": 999, "access_level": "extended"}'::jsonb
      WHEN p.role = 'researcher' THEN 
        '{"can_request_manuscripts": true, "max_requests": 50, "access_level": "academic", "can_download": true}'::jsonb
      WHEN p.role = 'partner' THEN 
        '{"can_request_manuscripts": true, "max_requests": 200, "access_level": "institutional", "priority_processing": true}'::jsonb
      WHEN p.role = 'subscriber' THEN 
        '{"can_request_manuscripts": true, "max_requests": 100, "access_level": "premium", "advanced_search": true}'::jsonb
      WHEN p.role = 'public_user' OR p.role = 'visitor' THEN 
        '{"can_view_public": true, "max_requests": 5, "access_level": "basic"}'::jsonb
      ELSE 
        '{"access_level": "none"}'::jsonb
    END as permissions
  FROM profiles p 
  WHERE p.user_id = user_uuid;
$$;