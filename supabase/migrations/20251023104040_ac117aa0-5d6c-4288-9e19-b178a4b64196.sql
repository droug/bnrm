-- Créer la table pour les tarifications des activités culturelles
CREATE TABLE IF NOT EXISTS public.cultural_activity_tariffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tariff_name TEXT NOT NULL,
  space_type TEXT CHECK (space_type IN ('salle', 'esplanade', 'auditorium', 'exposition', 'autre')),
  calculation_base TEXT NOT NULL CHECK (calculation_base IN ('heure', 'jour', 'demi_journee', 'evenement')),
  amount_ht NUMERIC NOT NULL DEFAULT 0,
  tva_rate NUMERIC NOT NULL DEFAULT 20,
  amount_ttc NUMERIC GENERATED ALWAYS AS (amount_ht * (1 + tva_rate / 100)) STORED,
  is_active BOOLEAN DEFAULT true,
  applies_to_public BOOLEAN DEFAULT true,
  applies_to_private BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer la table pour les règles conditionnelles de tarification
CREATE TABLE IF NOT EXISTS public.tariff_conditional_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tariff_id UUID NOT NULL REFERENCES public.cultural_activity_tariffs(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('organisme_type', 'date_range', 'nombre_jours', 'recurrence')),
  condition_value JSONB NOT NULL DEFAULT '{}',
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.cultural_activity_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariff_conditional_rules ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour cultural_activity_tariffs
CREATE POLICY "Admins peuvent gérer les tarifs"
  ON public.cultural_activity_tariffs
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Tout le monde peut voir les tarifs actifs"
  ON public.cultural_activity_tariffs
  FOR SELECT
  USING (is_active = true);

-- Politiques RLS pour tariff_conditional_rules
CREATE POLICY "Admins peuvent gérer les règles"
  ON public.tariff_conditional_rules
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Tout le monde peut voir les règles actives"
  ON public.tariff_conditional_rules
  FOR SELECT
  USING (is_active = true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_cultural_tariffs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cultural_tariffs_updated_at
  BEFORE UPDATE ON public.cultural_activity_tariffs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cultural_tariffs_updated_at();

-- Index pour améliorer les performances
CREATE INDEX idx_cultural_tariffs_space_type ON public.cultural_activity_tariffs(space_type);
CREATE INDEX idx_cultural_tariffs_active ON public.cultural_activity_tariffs(is_active);
CREATE INDEX idx_tariff_rules_tariff_id ON public.tariff_conditional_rules(tariff_id);
CREATE INDEX idx_tariff_rules_active ON public.tariff_conditional_rules(is_active);