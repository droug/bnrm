-- Étape 2: Créer la table des plans d'abonnement et les fonctions
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