-- Table pour l'historique de lecture et téléchargements
CREATE TABLE IF NOT EXISTS public.manuscript_reading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('read', 'download')),
  page_number integer,
  duration_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reading_history_user ON manuscript_reading_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_history_manuscript ON manuscript_reading_history(manuscript_id);

-- RLS pour l'historique de lecture
ALTER TABLE public.manuscript_reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading history"
ON public.manuscript_reading_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading history"
ON public.manuscript_reading_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reading history"
ON public.manuscript_reading_history
FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

-- Table pour les évaluations et commentaires des manuscrits
CREATE TABLE IF NOT EXISTS public.manuscript_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manuscript_id uuid REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_public boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, manuscript_id)
);

-- Index pour les évaluations
CREATE INDEX IF NOT EXISTS idx_reviews_manuscript ON manuscript_reviews(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON manuscript_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON manuscript_reviews(status);

-- RLS pour les évaluations
ALTER TABLE public.manuscript_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews"
ON public.manuscript_reviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews"
ON public.manuscript_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_public = false);

CREATE POLICY "Users can update their own reviews"
ON public.manuscript_reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.manuscript_reviews
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.manuscript_reviews
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Public can view approved public reviews"
ON public.manuscript_reviews
FOR SELECT
USING (is_public = true AND status = 'approved');

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_manuscript_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_manuscript_reviews_updated_at_trigger ON manuscript_reviews;
CREATE TRIGGER update_manuscript_reviews_updated_at_trigger
BEFORE UPDATE ON manuscript_reviews
FOR EACH ROW
EXECUTE FUNCTION update_manuscript_reviews_updated_at();

-- Vue pour les statistiques des dernières lectures
CREATE OR REPLACE VIEW manuscript_reading_stats AS
SELECT 
  user_id,
  manuscript_id,
  MAX(created_at) as last_read_at,
  COUNT(*) FILTER (WHERE action_type = 'read') as read_count,
  COUNT(*) FILTER (WHERE action_type = 'download') as download_count,
  MAX(page_number) as last_page
FROM manuscript_reading_history
GROUP BY user_id, manuscript_id;