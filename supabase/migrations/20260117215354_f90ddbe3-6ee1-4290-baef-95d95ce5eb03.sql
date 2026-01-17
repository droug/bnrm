
-- =============================================
-- BNRM Virtual Exhibitions 360° CMS - Schema
-- =============================================

-- Enum for exhibition workflow status
CREATE TYPE public.vexpo_status AS ENUM ('draft', 'in_review', 'published', 'archived');

-- Enum for hotspot types
CREATE TYPE public.vexpo_hotspot_type AS ENUM ('artwork', 'text', 'media', 'navigation');

-- Enum for CMS roles
CREATE TYPE public.vexpo_role AS ENUM ('super_admin', 'editor', 'reviewer');

-- =============================================
-- 1. EXHIBITIONS TABLE (Main entity)
-- =============================================
CREATE TABLE public.vexpo_exhibitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    status vexpo_status DEFAULT 'draft' NOT NULL,
    
    -- Bilingual content
    title_fr TEXT NOT NULL,
    title_ar TEXT,
    teaser_fr TEXT,
    teaser_ar TEXT,
    intro_fr TEXT,
    intro_ar TEXT,
    
    -- Dates
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Media
    cover_image_url TEXT,
    
    -- CTA Block for physical visit
    cta_title_fr TEXT,
    cta_title_ar TEXT,
    opening_hours_fr TEXT,
    opening_hours_ar TEXT,
    location_text_fr TEXT,
    location_text_ar TEXT,
    map_link TEXT,
    primary_button_label_fr TEXT,
    primary_button_label_ar TEXT,
    
    -- SEO French
    meta_title_fr TEXT,
    meta_description_fr TEXT,
    
    -- SEO Arabic
    meta_title_ar TEXT,
    meta_description_ar TEXT,
    
    -- Stats
    visitor_count INTEGER DEFAULT 0,
    
    -- Workflow
    created_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    published_by UUID REFERENCES auth.users(id),
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. PANORAMAS TABLE
-- =============================================
CREATE TABLE public.vexpo_panoramas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID NOT NULL REFERENCES public.vexpo_exhibitions(id) ON DELETE CASCADE,
    
    -- Bilingual names
    name_fr TEXT NOT NULL,
    name_ar TEXT,
    
    -- Order in exhibition (1-3 max)
    display_order INTEGER NOT NULL DEFAULT 1,
    
    -- Image URLs
    panorama_image_url TEXT NOT NULL,
    panorama_webp_url TEXT,
    thumbnail_url TEXT,
    
    -- Viewer settings
    initial_yaw DECIMAL(10,4) DEFAULT 0,
    initial_pitch DECIMAL(10,4) DEFAULT 0,
    min_zoom DECIMAL(5,2) DEFAULT 50,
    max_zoom DECIMAL(5,2) DEFAULT 120,
    auto_rotate BOOLEAN DEFAULT false,
    show_navigation_hints BOOLEAN DEFAULT true,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_exhibition_order UNIQUE (exhibition_id, display_order)
);

-- =============================================
-- 3. ARTWORKS/NOTICES TABLE
-- =============================================
CREATE TABLE public.vexpo_artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Bilingual content
    title_fr TEXT NOT NULL,
    title_ar TEXT,
    description_fr TEXT,
    description_ar TEXT,
    
    -- Metadata
    creator_author TEXT,
    creation_date TEXT,
    artwork_type TEXT, -- manuscript, photo, book, map, etc.
    inventory_id TEXT,
    keywords TEXT[],
    
    -- Images (multiple)
    images JSONB DEFAULT '[]'::jsonb,
    
    -- External links
    external_catalog_url TEXT,
    
    -- Physical visit CTA
    show_visit_cta BOOLEAN DEFAULT true,
    visit_cta_text_fr TEXT,
    visit_cta_text_ar TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. HOTSPOTS TABLE
-- =============================================
CREATE TABLE public.vexpo_hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panorama_id UUID NOT NULL REFERENCES public.vexpo_panoramas(id) ON DELETE CASCADE,
    
    -- Type
    hotspot_type vexpo_hotspot_type NOT NULL,
    
    -- Position (spherical coordinates)
    yaw DECIMAL(10,4) NOT NULL,
    pitch DECIMAL(10,4) NOT NULL,
    
    -- Bilingual labels
    label_fr TEXT,
    label_ar TEXT,
    
    -- Icon settings
    icon_name TEXT DEFAULT 'info',
    icon_size INTEGER DEFAULT 24,
    icon_color TEXT DEFAULT '#ffffff',
    
    -- Display rules
    show_on_mobile BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Content based on type
    artwork_id UUID REFERENCES public.vexpo_artworks(id) ON DELETE SET NULL,
    
    -- For TEXT type
    rich_text_fr TEXT,
    rich_text_ar TEXT,
    
    -- For MEDIA type
    media_url TEXT,
    media_type TEXT, -- audio, video, image
    caption_fr TEXT,
    caption_ar TEXT,
    
    -- For NAVIGATION type
    target_panorama_id UUID REFERENCES public.vexpo_panoramas(id) ON DELETE SET NULL,
    teleport_label_fr TEXT,
    teleport_label_ar TEXT,
    
    -- Order
    display_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 5. USER ROLES FOR CMS
-- =============================================
CREATE TABLE public.vexpo_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role vexpo_role NOT NULL,
    
    -- Audit
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- =============================================
-- 6. AUDIT LOGS
-- =============================================
CREATE TABLE public.vexpo_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    user_role vexpo_role,
    
    -- What
    action TEXT NOT NULL, -- create, update, delete, submit, approve, reject, publish, archive
    entity_type TEXT NOT NULL, -- exhibition, panorama, hotspot, artwork
    entity_id UUID NOT NULL,
    entity_title TEXT,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- When
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 7. REVIEW COMMENTS
-- =============================================
CREATE TABLE public.vexpo_review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exhibition_id UUID NOT NULL REFERENCES public.vexpo_exhibitions(id) ON DELETE CASCADE,
    
    -- Comment
    comment_text TEXT NOT NULL,
    
    -- Author
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    
    -- Type
    comment_type TEXT DEFAULT 'review', -- review, feedback, internal
    
    -- Status
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_vexpo_exhibitions_status ON public.vexpo_exhibitions(status);
CREATE INDEX idx_vexpo_exhibitions_dates ON public.vexpo_exhibitions(start_date, end_date);
CREATE INDEX idx_vexpo_exhibitions_slug ON public.vexpo_exhibitions(slug);
CREATE INDEX idx_vexpo_panoramas_exhibition ON public.vexpo_panoramas(exhibition_id);
CREATE INDEX idx_vexpo_hotspots_panorama ON public.vexpo_hotspots(panorama_id);
CREATE INDEX idx_vexpo_hotspots_artwork ON public.vexpo_hotspots(artwork_id);
CREATE INDEX idx_vexpo_audit_logs_entity ON public.vexpo_audit_logs(entity_type, entity_id);
CREATE INDEX idx_vexpo_audit_logs_user ON public.vexpo_audit_logs(user_id);
CREATE INDEX idx_vexpo_user_roles_user ON public.vexpo_user_roles(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.vexpo_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_panoramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vexpo_review_comments ENABLE ROW LEVEL SECURITY;

-- Function to check vexpo role
CREATE OR REPLACE FUNCTION public.has_vexpo_role(_user_id UUID, _role vexpo_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.vexpo_user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to check any vexpo role
CREATE OR REPLACE FUNCTION public.has_any_vexpo_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.vexpo_user_roles
        WHERE user_id = _user_id
    )
$$;

-- EXHIBITIONS POLICIES
-- Public can view published exhibitions
CREATE POLICY "Public can view published exhibitions"
ON public.vexpo_exhibitions FOR SELECT
USING (status = 'published');

-- Editors can view all exhibitions
CREATE POLICY "Editors can view all exhibitions"
ON public.vexpo_exhibitions FOR SELECT
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

-- Editors can create exhibitions
CREATE POLICY "Editors can create exhibitions"
ON public.vexpo_exhibitions FOR INSERT
TO authenticated
WITH CHECK (
    public.has_vexpo_role(auth.uid(), 'editor') OR 
    public.has_vexpo_role(auth.uid(), 'super_admin')
);

-- Editors can update their own drafts, super_admin can update all
CREATE POLICY "Editors can update exhibitions"
ON public.vexpo_exhibitions FOR UPDATE
TO authenticated
USING (
    public.has_vexpo_role(auth.uid(), 'super_admin') OR
    (public.has_vexpo_role(auth.uid(), 'editor') AND created_by = auth.uid()) OR
    (public.has_vexpo_role(auth.uid(), 'reviewer') AND status = 'in_review')
);

-- Only super_admin can delete
CREATE POLICY "Super admin can delete exhibitions"
ON public.vexpo_exhibitions FOR DELETE
TO authenticated
USING (public.has_vexpo_role(auth.uid(), 'super_admin'));

-- PANORAMAS POLICIES
CREATE POLICY "Public can view panoramas of published exhibitions"
ON public.vexpo_panoramas FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.vexpo_exhibitions e
        WHERE e.id = exhibition_id AND e.status = 'published'
    )
);

CREATE POLICY "CMS users can manage panoramas"
ON public.vexpo_panoramas FOR ALL
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

-- HOTSPOTS POLICIES
CREATE POLICY "Public can view hotspots of published exhibitions"
ON public.vexpo_hotspots FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.vexpo_panoramas p
        JOIN public.vexpo_exhibitions e ON e.id = p.exhibition_id
        WHERE p.id = panorama_id AND e.status = 'published'
    )
);

CREATE POLICY "CMS users can manage hotspots"
ON public.vexpo_hotspots FOR ALL
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

-- ARTWORKS POLICIES
CREATE POLICY "Public can view active artworks"
ON public.vexpo_artworks FOR SELECT
USING (is_active = true);

CREATE POLICY "CMS users can manage artworks"
ON public.vexpo_artworks FOR ALL
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

-- USER ROLES POLICIES
CREATE POLICY "Users can view their own roles"
ON public.vexpo_user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage roles"
ON public.vexpo_user_roles FOR ALL
TO authenticated
USING (public.has_vexpo_role(auth.uid(), 'super_admin'));

-- AUDIT LOGS POLICIES
CREATE POLICY "CMS users can view audit logs"
ON public.vexpo_audit_logs FOR SELECT
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.vexpo_audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- REVIEW COMMENTS POLICIES
CREATE POLICY "CMS users can view comments"
ON public.vexpo_review_comments FOR SELECT
TO authenticated
USING (public.has_any_vexpo_role(auth.uid()));

CREATE POLICY "CMS users can add comments"
ON public.vexpo_review_comments FOR INSERT
TO authenticated
WITH CHECK (public.has_any_vexpo_role(auth.uid()));

CREATE POLICY "CMS users can update their comments"
ON public.vexpo_review_comments FOR UPDATE
TO authenticated
USING (author_id = auth.uid() OR public.has_vexpo_role(auth.uid(), 'super_admin'));

-- =============================================
-- TRIGGER FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION public.update_vexpo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vexpo_exhibitions_updated_at
    BEFORE UPDATE ON public.vexpo_exhibitions
    FOR EACH ROW EXECUTE FUNCTION public.update_vexpo_updated_at();

CREATE TRIGGER update_vexpo_panoramas_updated_at
    BEFORE UPDATE ON public.vexpo_panoramas
    FOR EACH ROW EXECUTE FUNCTION public.update_vexpo_updated_at();

CREATE TRIGGER update_vexpo_artworks_updated_at
    BEFORE UPDATE ON public.vexpo_artworks
    FOR EACH ROW EXECUTE FUNCTION public.update_vexpo_updated_at();

CREATE TRIGGER update_vexpo_hotspots_updated_at
    BEFORE UPDATE ON public.vexpo_hotspots
    FOR EACH ROW EXECUTE FUNCTION public.update_vexpo_updated_at();

-- =============================================
-- AUTO-GENERATE SLUG FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_vexpo_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from French title
    base_slug := lower(regexp_replace(NEW.title_fr, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.vexpo_exhibitions WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_vexpo_exhibition_slug
    BEFORE INSERT OR UPDATE OF title_fr ON public.vexpo_exhibitions
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION public.generate_vexpo_slug();
