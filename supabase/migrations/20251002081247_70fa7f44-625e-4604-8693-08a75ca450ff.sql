-- Create reading_history table for tracking user consultations
CREATE TABLE public.reading_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('manuscript', 'book', 'periodical', 'document')),
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'download', 'read')),
  title TEXT NOT NULL,
  author TEXT,
  thumbnail_url TEXT,
  last_page_read INTEGER,
  reading_progress NUMERIC DEFAULT 0 CHECK (reading_progress >= 0 AND reading_progress <= 100),
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT check_content_reference CHECK (
    (content_id IS NOT NULL AND manuscript_id IS NULL) OR
    (content_id IS NULL AND manuscript_id IS NOT NULL)
  )
);

CREATE INDEX idx_reading_history_user ON public.reading_history(user_id);
CREATE INDEX idx_reading_history_created ON public.reading_history(created_at DESC);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('manuscript', 'book', 'periodical', 'document')),
  title TEXT NOT NULL,
  author TEXT,
  thumbnail_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_favorite UNIQUE (user_id, content_id, manuscript_id),
  CONSTRAINT check_favorite_content CHECK (
    (content_id IS NOT NULL AND manuscript_id IS NULL) OR
    (content_id IS NULL AND manuscript_id IS NOT NULL)
  )
);

CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_created ON public.favorites(created_at DESC);

-- Create user_bookmarks table for saved page markers
CREATE TABLE public.user_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_bookmark UNIQUE (user_id, content_id, manuscript_id, page_number),
  CONSTRAINT check_bookmark_content CHECK (
    (content_id IS NOT NULL AND manuscript_id IS NULL) OR
    (content_id IS NULL AND manuscript_id IS NOT NULL)
  )
);

CREATE INDEX idx_user_bookmarks_user ON public.user_bookmarks(user_id);

-- Create user_reviews table for private feedback
CREATE TABLE public.user_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_reviewed_by_admin BOOLEAN DEFAULT FALSE,
  admin_response TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_review UNIQUE (user_id, content_id, manuscript_id),
  CONSTRAINT check_review_content CHECK (
    (content_id IS NOT NULL AND manuscript_id IS NULL) OR
    (content_id IS NULL AND manuscript_id IS NOT NULL)
  )
);

CREATE INDEX idx_user_reviews_user ON public.user_reviews(user_id);
CREATE INDEX idx_user_reviews_admin_review ON public.user_reviews(is_reviewed_by_admin);

-- Enable RLS
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reading_history
CREATE POLICY "Users can view their own reading history"
  ON public.reading_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading history"
  ON public.reading_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading history"
  ON public.reading_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reading history"
  ON public.reading_history FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for favorites
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON public.user_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_reviews
CREATE POLICY "Users can view their own reviews"
  ON public.user_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
  ON public.user_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.user_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
  ON public.user_reviews FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Admins can update reviews"
  ON public.user_reviews FOR UPDATE
  USING (is_admin_or_librarian(auth.uid()));

-- Create trigger for updating timestamps
CREATE TRIGGER update_reading_history_updated_at
  BEFORE UPDATE ON public.reading_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reviews_updated_at
  BEFORE UPDATE ON public.user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();