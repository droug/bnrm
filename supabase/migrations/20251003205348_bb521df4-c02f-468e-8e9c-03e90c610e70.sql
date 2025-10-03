-- Ajout des colonnes de configuration pour la sécurité et les fonctionnalités de consultation des manuscrits

ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS block_right_click boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS block_screenshot boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_download boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_print boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_email_share boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS page_count integer,
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS pages_data jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS has_ocr boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS permalink text UNIQUE;

-- Création d'un index pour les permaliens
CREATE INDEX IF NOT EXISTS idx_manuscripts_permalink ON manuscripts(permalink);

-- Création de la table pour les marque-pages des utilisateurs
CREATE TABLE IF NOT EXISTS public.manuscript_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, manuscript_id, page_number)
);

-- RLS pour manuscript_bookmarks
ALTER TABLE public.manuscript_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
ON public.manuscript_bookmarks
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Création de la table pour les paramètres de consultation par défaut
CREATE TABLE IF NOT EXISTS public.manuscript_viewer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_right_click_default boolean DEFAULT false,
  block_screenshot_default boolean DEFAULT false,
  allow_download_default boolean DEFAULT true,
  allow_print_default boolean DEFAULT true,
  allow_email_share_default boolean DEFAULT true,
  max_zoom integer DEFAULT 200,
  min_zoom integer DEFAULT 50,
  default_view_mode text DEFAULT 'single' CHECK (default_view_mode IN ('single', 'double')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS pour manuscript_viewer_settings
ALTER TABLE public.manuscript_viewer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage viewer settings"
ON public.manuscript_viewer_settings
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view viewer settings"
ON public.manuscript_viewer_settings
FOR SELECT
USING (true);

-- Insertion des paramètres par défaut si la table est vide
INSERT INTO public.manuscript_viewer_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.manuscript_viewer_settings);

-- Fonction pour générer un permalien unique
CREATE OR REPLACE FUNCTION generate_manuscript_permalink()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.permalink IS NULL THEN
    NEW.permalink := 'ms-' || substring(NEW.id::text from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le permalien
DROP TRIGGER IF EXISTS set_manuscript_permalink ON manuscripts;
CREATE TRIGGER set_manuscript_permalink
BEFORE INSERT ON manuscripts
FOR EACH ROW
EXECUTE FUNCTION generate_manuscript_permalink();