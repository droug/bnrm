-- Table pour les éléments de visite guidée des expositions virtuelles
CREATE TABLE public.exhibition_tour_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exhibition_id UUID NOT NULL REFERENCES public.virtual_exhibitions(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'document' CHECK (item_type IN ('intro', 'document', 'section')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  year TEXT,
  origin TEXT,
  technique TEXT,
  dimensions TEXT,
  details TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exhibition_tour_items ENABLE ROW LEVEL SECURITY;

-- Policies for public read
CREATE POLICY "Tour items are viewable by everyone"
ON public.exhibition_tour_items
FOR SELECT
USING (is_active = true);

-- Policies for admin/librarian write access
CREATE POLICY "Admins and librarians can manage tour items"
ON public.exhibition_tour_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

-- Index for performance
CREATE INDEX idx_exhibition_tour_items_exhibition ON public.exhibition_tour_items(exhibition_id);
CREATE INDEX idx_exhibition_tour_items_order ON public.exhibition_tour_items(exhibition_id, display_order);

-- Trigger for updated_at
CREATE TRIGGER update_exhibition_tour_items_updated_at
BEFORE UPDATE ON public.exhibition_tour_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();