-- Create content types enum
CREATE TYPE public.content_type AS ENUM ('news', 'event', 'exhibition', 'page');

-- Create content status enum  
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');

-- Create content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_body TEXT NOT NULL,
  content_type content_type NOT NULL,
  status content_status DEFAULT 'draft',
  featured_image_url TEXT,
  author_id UUID NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE, -- Pour événements et expositions
  end_date TIMESTAMP WITH TIME ZONE,   -- Pour événements et expositions
  location TEXT,                       -- Pour événements et expositions
  tags TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  seo_keywords TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_content_type ON public.content(content_type);
CREATE INDEX idx_content_status ON public.content(status);
CREATE INDEX idx_content_published_at ON public.content(published_at);
CREATE INDEX idx_content_slug ON public.content(slug);
CREATE INDEX idx_content_featured ON public.content(is_featured);
CREATE INDEX idx_content_tags ON public.content USING GIN(tags);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view published content
CREATE POLICY "Everyone can view published content" ON public.content
  FOR SELECT USING (status = 'published');

-- Admins and librarians can manage all content
CREATE POLICY "Admins and librarians can manage all content" ON public.content
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Authors can view their own content
CREATE POLICY "Authors can view their own content" ON public.content
  FOR SELECT USING (author_id = auth.uid());

-- Authors can create content
CREATE POLICY "Authors can create content" ON public.content
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Authors can update their own content (only if not published or if they're admin/librarian)
CREATE POLICY "Authors can update their own content" ON public.content
  FOR UPDATE USING (
    author_id = auth.uid() AND 
    (status != 'published' OR is_admin_or_librarian(auth.uid()))
  );

-- Create content categories table
CREATE TABLE public.content_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  content_type content_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for content-category relationships
CREATE TABLE public.content_category_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_id, category_id)
);

-- Enable RLS on category tables
ALTER TABLE public.content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_category_relations ENABLE ROW LEVEL SECURITY;

-- Category RLS policies
CREATE POLICY "Everyone can view categories" ON public.content_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins and librarians can manage categories" ON public.content_categories
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Everyone can view category relations" ON public.content_category_relations
  FOR SELECT USING (true);

CREATE POLICY "Admins and librarians can manage category relations" ON public.content_category_relations
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- Insert default categories
INSERT INTO public.content_categories (name, slug, description, content_type) VALUES
  ('Actualités générales', 'actualites-generales', 'Nouvelles et actualités du patrimoine', 'news'),
  ('Acquisitions', 'acquisitions', 'Nouvelles acquisitions de manuscrits', 'news'),
  ('Recherche', 'recherche', 'Actualités de la recherche', 'news'),
  ('Conférences', 'conferences', 'Conférences et colloques', 'event'),
  ('Ateliers', 'ateliers', 'Ateliers et formations', 'event'),
  ('Expositions temporaires', 'expositions-temporaires', 'Expositions temporaires', 'exhibition'),
  ('Expositions permanentes', 'expositions-permanentes', 'Expositions permanentes', 'exhibition'),
  ('À propos', 'a-propos', 'Pages d''information sur l''institution', 'page'),
  ('Services', 'services', 'Description des services offerts', 'page');

-- Create trigger for updated_at
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_content_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert title to slug format
  base_slug := lower(regexp_replace(
    regexp_replace(
      regexp_replace(title, '[àáâãäå]', 'a', 'g'),
      '[èéêë]', 'e', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM content WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;