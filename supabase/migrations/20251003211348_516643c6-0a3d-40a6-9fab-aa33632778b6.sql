-- Enable pg_trgm extension for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table pour les paramètres de recherche
CREATE TABLE IF NOT EXISTS public.search_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  results_per_page integer NOT NULL DEFAULT 20,
  enable_fulltext_search boolean DEFAULT true,
  enable_faceted_search boolean DEFAULT true,
  enable_realtime_indexing boolean DEFAULT true,
  highlight_color text DEFAULT '#FFEB3B',
  snippet_length integer DEFAULT 150,
  max_results integer DEFAULT 1000,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS pour search_settings
ALTER TABLE public.search_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage search settings"
ON public.search_settings
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view search settings"
ON public.search_settings
FOR SELECT
USING (true);

-- Insérer les paramètres par défaut
INSERT INTO public.search_settings (results_per_page, enable_fulltext_search, enable_faceted_search, enable_realtime_indexing)
VALUES (20, true, true, true)
ON CONFLICT DO NOTHING;

-- Ajout de champs pour les manuscrits
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS full_text_content text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS search_keywords text[];
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS genre text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS subject text[];
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS publication_year integer;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS cote text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.manuscripts ADD COLUMN IF NOT EXISTS historical_period text;

-- Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_manuscripts_is_visible ON public.manuscripts(is_visible);
CREATE INDEX IF NOT EXISTS idx_manuscripts_title_trgm ON public.manuscripts USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manuscripts_author_trgm ON public.manuscripts USING gin(author gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manuscripts_description_trgm ON public.manuscripts USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manuscripts_full_text ON public.manuscripts USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '') || ' ' || coalesce(full_text_content, '')));
CREATE INDEX IF NOT EXISTS idx_manuscripts_keywords ON public.manuscripts USING gin(search_keywords);
CREATE INDEX IF NOT EXISTS idx_manuscripts_subject ON public.manuscripts USING gin(subject);

-- Fonction pour mettre à jour le contenu plein texte
CREATE OR REPLACE FUNCTION update_manuscript_fulltext()
RETURNS TRIGGER AS $$
BEGIN
  -- Combiner tous les champs texte pour la recherche plein texte
  NEW.full_text_content := 
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.author, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.language, '') || ' ' ||
    coalesce(NEW.period, '') || ' ' ||
    coalesce(NEW.material, '') || ' ' ||
    coalesce(NEW.condition_notes, '') || ' ' ||
    coalesce(NEW.inventory_number, '') || ' ' ||
    coalesce(NEW.genre, '') || ' ' ||
    coalesce(NEW.cote, '') || ' ' ||
    coalesce(NEW.source, '') || ' ' ||
    coalesce(NEW.historical_period, '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le contenu plein texte
DROP TRIGGER IF EXISTS update_manuscript_fulltext_trigger ON public.manuscripts;
CREATE TRIGGER update_manuscript_fulltext_trigger
BEFORE INSERT OR UPDATE ON public.manuscripts
FOR EACH ROW
EXECUTE FUNCTION update_manuscript_fulltext();

-- Table pour les logs de recherche (analytics)
CREATE TABLE IF NOT EXISTS public.search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  selected_result_id uuid,
  search_duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour search_logs
CREATE INDEX IF NOT EXISTS idx_search_logs_user ON public.search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON public.search_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON public.search_logs USING gin(to_tsvector('french', query));

-- RLS pour search_logs
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create search logs"
ON public.search_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all search logs"
ON public.search_logs
FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

-- Fonction pour enregistrer une recherche
CREATE OR REPLACE FUNCTION log_search(
  p_query text,
  p_filters jsonb DEFAULT '{}'::jsonb,
  p_results_count integer DEFAULT 0,
  p_search_duration_ms integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.search_logs (
    user_id,
    query,
    filters,
    results_count,
    search_duration_ms
  ) VALUES (
    auth.uid(),
    p_query,
    p_filters,
    p_results_count,
    p_search_duration_ms
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;