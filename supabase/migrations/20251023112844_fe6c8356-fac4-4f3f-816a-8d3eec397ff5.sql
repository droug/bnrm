-- Create activity types table
CREATE TABLE IF NOT EXISTS public.activity_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create equipment types table
CREATE TABLE IF NOT EXISTS public.equipment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'audio', 'lighting', 'furniture', 'technical', etc.
  unit_price NUMERIC(10,2) DEFAULT 0,
  unit_type TEXT DEFAULT 'unit', -- 'unit', 'hour', 'day'
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_types
CREATE POLICY "Everyone can view active activity types"
  ON public.activity_types
  FOR SELECT
  USING (is_active = true OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage activity types"
  ON public.activity_types
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Create policies for equipment_types
CREATE POLICY "Everyone can view active equipment types"
  ON public.equipment_types
  FOR SELECT
  USING (is_active = true OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can manage equipment types"
  ON public.equipment_types
  FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Create indexes
CREATE INDEX idx_activity_types_sort_order ON public.activity_types(sort_order);
CREATE INDEX idx_equipment_types_sort_order ON public.equipment_types(sort_order);
CREATE INDEX idx_equipment_types_category ON public.equipment_types(category);

-- Insert default activity types
INSERT INTO public.activity_types (name, description, color, sort_order) VALUES
  ('Conférence', 'Présentation formelle devant un public', '#3B82F6', 1),
  ('Atelier', 'Session pratique et interactive', '#8B5CF6', 2),
  ('Exposition', 'Présentation artistique ou culturelle', '#EC4899', 3),
  ('Projection', 'Diffusion de contenu audiovisuel', '#F59E0B', 4),
  ('Spectacle', 'Performance artistique', '#10B981', 5),
  ('Séminaire', 'Session de formation approfondie', '#6366F1', 6)
ON CONFLICT DO NOTHING;

-- Insert default equipment types
INSERT INTO public.equipment_types (name, description, category, unit_price, unit_type, sort_order) VALUES
  ('Sonorisation complète', 'Système audio professionnel', 'audio', 500.00, 'day', 1),
  ('Microphone sans fil', 'Micro HF portable', 'audio', 50.00, 'unit', 2),
  ('Éclairage scénique', 'Projecteurs et console lumière', 'lighting', 400.00, 'day', 3),
  ('Vidéoprojecteur HD', 'Projecteur haute définition', 'technical', 150.00, 'day', 4),
  ('Écran de projection', 'Écran motorisé grand format', 'technical', 100.00, 'day', 5),
  ('Tables et chaises', 'Mobilier événementiel', 'furniture', 10.00, 'unit', 6),
  ('Pupitre conférencier', 'Pupitre avec éclairage', 'furniture', 30.00, 'unit', 7),
  ('Console de mixage', 'Table de mixage audio', 'technical', 200.00, 'day', 8)
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_activity_types_updated_at
  BEFORE UPDATE ON public.activity_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_types_updated_at
  BEFORE UPDATE ON public.equipment_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();