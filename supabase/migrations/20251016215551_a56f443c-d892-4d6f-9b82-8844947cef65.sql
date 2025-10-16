-- Table pour gérer les listes de valeurs paramétrables
CREATE TABLE public.system_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_code text NOT NULL UNIQUE,
  list_name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les valeurs des listes
CREATE TABLE public.system_list_values (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES public.system_lists(id) ON DELETE CASCADE,
  value_code text NOT NULL,
  value_label text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(list_id, value_code)
);

-- Index pour améliorer les performances
CREATE INDEX idx_system_list_values_list_id ON public.system_list_values(list_id);
CREATE INDEX idx_system_list_values_active ON public.system_list_values(is_active);

-- Enable RLS
ALTER TABLE public.system_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_list_values ENABLE ROW LEVEL SECURITY;

-- Policies pour system_lists
CREATE POLICY "Tout le monde peut voir les listes actives"
  ON public.system_lists FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les listes"
  ON public.system_lists FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Policies pour system_list_values
CREATE POLICY "Tout le monde peut voir les valeurs actives"
  ON public.system_list_values FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins peuvent gérer les valeurs"
  ON public.system_list_values FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour updated_at
CREATE TRIGGER update_system_lists_updated_at
  BEFORE UPDATE ON public.system_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_list_values_updated_at
  BEFORE UPDATE ON public.system_list_values
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion des listes initiales
INSERT INTO public.system_lists (list_code, list_name, description) VALUES
  ('TYPE_PUBLICATION', 'Type de publication', 'Types de publications pour le dépôt légal');

-- Insertion des valeurs pour Type de publication
INSERT INTO public.system_list_values (list_id, value_code, value_label, sort_order)
SELECT id, 'COR', 'Coran', 1 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'THE', 'Thèse', 2 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'BEL', 'Beau livre', 3 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'EXP', 'Exposition', 4 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'COL', 'Colloque', 5 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'HOM', 'Hommage', 6 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION'
UNION ALL
SELECT id, 'PAR', 'Parascolaire / Scolaire', 7 FROM public.system_lists WHERE list_code = 'TYPE_PUBLICATION';