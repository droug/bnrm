-- ============================================
-- CMS HEADLESS POUR BIBLIOTHÈQUE NUMÉRIQUE
-- Support bilingue FR/AR, Workflow de publication
-- ============================================

-- Table des pages CMS
CREATE TABLE cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Contenu bilingue
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  
  -- SEO bilingue
  seo_title_fr TEXT,
  seo_title_ar TEXT,
  seo_description_fr TEXT,
  seo_description_ar TEXT,
  seo_canonical TEXT,
  seo_keywords_fr TEXT[],
  seo_keywords_ar TEXT[],
  
  -- Statut et workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'published', 'archived')),
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Commentaires internes workflow
  workflow_comments JSONB DEFAULT '[]'::jsonb
);

-- Table des sections (polymorphes)
CREATE TABLE cms_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES cms_pages(id) ON DELETE CASCADE,
  
  -- Type de section
  section_type TEXT NOT NULL CHECK (section_type IN (
    'hero', 'richtext', 'grid', 'cardList', 'banner', 
    'faq', 'eventList', 'image', 'video', 'callout', 'statBlocks'
  )),
  
  -- Contenu polymorphe bilingue
  title_fr TEXT,
  title_ar TEXT,
  content_fr TEXT,
  content_ar TEXT,
  
  -- Props JSON pour chaque type
  props JSONB DEFAULT '{}'::jsonb,
  
  -- Ordre et visibilité
  order_index INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des actualités
CREATE TABLE cms_actualites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Contenu bilingue
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  chapo_fr TEXT,
  chapo_ar TEXT,
  body_fr TEXT,
  body_ar TEXT,
  
  -- Média
  image_url TEXT,
  image_alt_fr TEXT,
  image_alt_ar TEXT,
  
  -- Catégorisation
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT,
  
  -- Dates
  date_publication TIMESTAMPTZ,
  
  -- Statut et workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'published', 'archived')),
  
  -- SEO
  seo_title_fr TEXT,
  seo_title_ar TEXT,
  seo_description_fr TEXT,
  seo_description_ar TEXT,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Stats
  view_count INT DEFAULT 0,
  
  workflow_comments JSONB DEFAULT '[]'::jsonb
);

-- Table des événements
CREATE TABLE cms_evenements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  
  -- Contenu bilingue
  title_fr TEXT NOT NULL,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  
  -- Dates événement
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  
  -- Localisation
  lieu_fr TEXT,
  lieu_ar TEXT,
  
  -- Média
  affiche_url TEXT,
  affiche_alt_fr TEXT,
  affiche_alt_ar TEXT,
  
  -- CTA vers écrans métiers BN
  cta_label_fr TEXT,
  cta_label_ar TEXT,
  cta_url TEXT,
  
  -- Catégorisation
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  event_type TEXT,
  
  -- Statut et workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'published', 'archived')),
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  workflow_comments JSONB DEFAULT '[]'::jsonb
);

-- Table des bannières
CREATE TABLE cms_bannieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenu bilingue
  title_fr TEXT,
  title_ar TEXT,
  text_fr TEXT,
  text_ar TEXT,
  
  -- Média
  image_url TEXT NOT NULL,
  image_alt_fr TEXT,
  image_alt_ar TEXT,
  
  -- Lien
  link_url TEXT,
  link_label_fr TEXT,
  link_label_ar TEXT,
  
  -- Période d'affichage
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Position et priorité
  position TEXT CHECK (position IN ('top', 'middle', 'bottom', 'sidebar')),
  priority INT DEFAULT 0,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'ready', 'published', 'archived')),
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des menus
CREATE TABLE cms_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  menu_code TEXT NOT NULL UNIQUE,
  menu_name TEXT NOT NULL,
  
  -- Items (structure JSON)
  items JSONB DEFAULT '[]'::jsonb,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table du footer
CREATE TABLE cms_footer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Structure (JSON)
  columns JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  logos JSONB DEFAULT '[]'::jsonb,
  
  -- Texte légal bilingue
  legal_text_fr TEXT,
  legal_text_ar TEXT,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des médias
CREATE TABLE cms_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Fichier
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_kb INT,
  
  -- Métadonnées bilingues
  alt_fr TEXT,
  alt_ar TEXT,
  title_fr TEXT,
  title_ar TEXT,
  description_fr TEXT,
  description_ar TEXT,
  
  -- Licence et droits
  licence TEXT,
  copyright TEXT,
  
  -- Variantes (WebP, AVIF, etc.)
  variants JSONB DEFAULT '{}'::jsonb,
  
  -- Dimensions (pour images)
  width INT,
  height INT,
  
  -- Catégorisation
  folder TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Métadonnées
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des webhooks
CREATE TABLE cms_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Configuration
  webhook_url TEXT NOT NULL,
  webhook_name TEXT NOT NULL,
  
  -- Événements déclencheurs
  trigger_events TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  
  -- Stats
  last_triggered_at TIMESTAMPTZ,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  
  -- Métadonnées
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des logs webhooks
CREATE TABLE cms_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES cms_webhooks(id) ON DELETE CASCADE,
  
  -- Détails
  event_type TEXT NOT NULL,
  payload JSONB,
  
  -- Résultat
  status TEXT CHECK (status IN ('success', 'error', 'pending')),
  response_code INT,
  response_body TEXT,
  error_message TEXT,
  
  -- Timing
  triggered_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Table d'audit CMS
CREATE TABLE cms_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Entité concernée
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Action
  action TEXT NOT NULL,
  
  -- Utilisateur
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_role TEXT,
  
  -- Détails
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES pour performance
-- ============================================

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_status ON cms_pages(status);
CREATE INDEX idx_cms_pages_published_at ON cms_pages(published_at);

CREATE INDEX idx_cms_sections_page_id ON cms_sections(page_id);
CREATE INDEX idx_cms_sections_order ON cms_sections(page_id, order_index);

CREATE INDEX idx_cms_actualites_slug ON cms_actualites(slug);
CREATE INDEX idx_cms_actualites_status ON cms_actualites(status);
CREATE INDEX idx_cms_actualites_date ON cms_actualites(date_publication DESC);
CREATE INDEX idx_cms_actualites_tags ON cms_actualites USING GIN(tags);

CREATE INDEX idx_cms_evenements_slug ON cms_evenements(slug);
CREATE INDEX idx_cms_evenements_dates ON cms_evenements(date_debut, date_fin);
CREATE INDEX idx_cms_evenements_status ON cms_evenements(status);

CREATE INDEX idx_cms_bannieres_period ON cms_bannieres(start_date, end_date);
CREATE INDEX idx_cms_bannieres_active ON cms_bannieres(is_active);

CREATE INDEX idx_cms_media_folder ON cms_media(folder);
CREATE INDEX idx_cms_media_tags ON cms_media USING GIN(tags);

CREATE INDEX idx_cms_audit_entity ON cms_audit_logs(entity_type, entity_id);
CREATE INDEX idx_cms_audit_date ON cms_audit_logs(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Pages
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages publiques visibles par tous"
  ON cms_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Rédacteurs peuvent créer pages"
  ON cms_pages FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auteurs et admins peuvent modifier"
  ON cms_pages FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    is_admin_or_librarian(auth.uid())
  );

CREATE POLICY "Admins peuvent supprimer"
  ON cms_pages FOR DELETE
  USING (is_admin_or_librarian(auth.uid()));

-- Sections
ALTER TABLE cms_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections visibles selon page"
  ON cms_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cms_pages 
      WHERE cms_pages.id = cms_sections.page_id 
      AND cms_pages.status = 'published'
    ) OR auth.uid() IS NOT NULL
  );

CREATE POLICY "Gestion sections selon page"
  ON cms_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cms_pages 
      WHERE cms_pages.id = cms_sections.page_id 
      AND (cms_pages.created_by = auth.uid() OR is_admin_or_librarian(auth.uid()))
    )
  );

-- Actualités
ALTER TABLE cms_actualites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Actualités publiées visibles"
  ON cms_actualites FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Création actualités"
  ON cms_actualites FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Modification actualités"
  ON cms_actualites FOR UPDATE
  USING (created_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Suppression actualités"
  ON cms_actualites FOR DELETE
  USING (is_admin_or_librarian(auth.uid()));

-- Événements
ALTER TABLE cms_evenements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Événements publiés visibles"
  ON cms_evenements FOR SELECT
  USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Création événements"
  ON cms_evenements FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Modification événements"
  ON cms_evenements FOR UPDATE
  USING (created_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Suppression événements"
  ON cms_evenements FOR DELETE
  USING (is_admin_or_librarian(auth.uid()));

-- Bannières
ALTER TABLE cms_bannieres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bannières actives visibles"
  ON cms_bannieres FOR SELECT
  USING (
    is_active = true AND 
    status = 'published' AND
    (start_date IS NULL OR start_date <= now()) AND
    (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Gestion bannières"
  ON cms_bannieres FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Menus
ALTER TABLE cms_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Menus visibles"
  ON cms_menus FOR SELECT
  USING (is_active = true);

CREATE POLICY "Gestion menus"
  ON cms_menus FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Footer
ALTER TABLE cms_footer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Footer visible"
  ON cms_footer FOR SELECT
  USING (is_active = true);

CREATE POLICY "Gestion footer"
  ON cms_footer FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Media
ALTER TABLE cms_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media visibles"
  ON cms_media FOR SELECT
  USING (true);

CREATE POLICY "Upload media"
  ON cms_media FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Modification media"
  ON cms_media FOR UPDATE
  USING (uploaded_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Suppression media"
  ON cms_media FOR DELETE
  USING (uploaded_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Webhooks
ALTER TABLE cms_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestion webhooks admins"
  ON cms_webhooks FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Webhook logs
ALTER TABLE cms_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture logs webhooks"
  ON cms_webhook_logs FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Système insère logs"
  ON cms_webhook_logs FOR INSERT
  WITH CHECK (true);

-- Audit logs
ALTER TABLE cms_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins voient audit"
  ON cms_audit_logs FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Système insère audit"
  ON cms_audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_sections_updated_at BEFORE UPDATE ON cms_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_actualites_updated_at BEFORE UPDATE ON cms_actualites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_evenements_updated_at BEFORE UPDATE ON cms_evenements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_bannieres_updated_at BEFORE UPDATE ON cms_bannieres
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_menus_updated_at BEFORE UPDATE ON cms_menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_footer_updated_at BEFORE UPDATE ON cms_footer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_media_updated_at BEFORE UPDATE ON cms_media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();