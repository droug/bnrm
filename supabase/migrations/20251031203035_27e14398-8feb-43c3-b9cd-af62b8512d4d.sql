-- =====================================================
-- HIÉRARCHIE DES CATALOGUES
-- CBM > CBN/Portail BNRM > Bibliothèque Numérique > Manuscrits
-- =====================================================

-- 1. CBM Catalog (Niveau le plus large - toutes les bibliothèques marocaines)
CREATE TABLE IF NOT EXISTS public.cbm_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identification
  cbm_record_id TEXT UNIQUE NOT NULL, -- Identifiant unique dans le réseau CBM
  source_library TEXT NOT NULL, -- Bibliothèque source (BNRM, autres bibliothèques)
  
  -- Métadonnées bibliographiques de base
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT,
  author_ar TEXT,
  publication_year INTEGER,
  publisher TEXT,
  isbn TEXT,
  
  -- Classification
  dewey_classification TEXT,
  subject_headings TEXT[],
  
  -- Localisation
  library_name TEXT NOT NULL,
  library_code TEXT NOT NULL,
  shelf_location TEXT,
  
  -- Type et disponibilité
  document_type TEXT, -- livre, périodique, manuscrit, etc.
  availability_status TEXT DEFAULT 'available', -- available, borrowed, unavailable
  
  -- Lien vers le catalogue local (CBN si BNRM)
  cbn_document_id UUID, -- Référence vers cbn_documents si source = 'BNRM'
  
  -- Métadonnées techniques
  metadata_source TEXT, -- Z39.50, SRU, OAI-PMH
  last_sync_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. CBN Documents (Portail BNRM - tous les documents BNRM)
CREATE TABLE IF NOT EXISTS public.cbn_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identification
  cote TEXT UNIQUE NOT NULL, -- Cote de la BNRM
  unimarc_record_id TEXT, -- ID du notice UNIMARC
  
  -- Métadonnées bibliographiques complètes
  title TEXT NOT NULL,
  title_ar TEXT,
  subtitle TEXT,
  subtitle_ar TEXT,
  author TEXT,
  author_ar TEXT,
  secondary_authors TEXT[],
  publisher TEXT,
  publication_place TEXT,
  publication_year INTEGER,
  edition TEXT,
  
  -- Description physique
  pages_count INTEGER,
  dimensions TEXT, -- ex: "24 cm"
  physical_description TEXT,
  
  -- Classification et indexation
  dewey_classification TEXT,
  subject_headings TEXT[],
  keywords TEXT[],
  collection_name TEXT,
  
  -- ISBN/ISSN
  isbn TEXT,
  issn TEXT,
  
  -- Type de document
  document_type TEXT NOT NULL, -- livre, périodique, manuscrit, carte, etc.
  support_type TEXT, -- papier, numérique, microfilm, etc.
  
  -- Statut et localisation physique
  physical_status TEXT DEFAULT 'available', -- available, borrowed, in_restoration, unavailable
  location TEXT, -- Salle de lecture, Magasin, etc.
  shelf_location TEXT,
  
  -- Numérisation
  is_digitized BOOLEAN DEFAULT false,
  digital_library_document_id UUID, -- Lien vers digital_library_documents si numérisé
  
  -- Accès et restrictions
  access_level TEXT DEFAULT 'public', -- public, restricted, confidential
  consultation_mode TEXT, -- sur_place, pret, reproduction, numerique
  
  -- Lien vers CBM
  cbm_catalog_id UUID, -- Référence vers cbm_catalog
  
  -- Notes
  notes TEXT,
  internal_notes TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Digital Library Documents (Bibliothèque Numérique - uniquement documents numérisés)
CREATE TABLE IF NOT EXISTS public.digital_library_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Lien obligatoire vers le document source CBN
  cbn_document_id UUID NOT NULL,
  
  -- Informations de numérisation
  digitization_date DATE,
  digitization_quality TEXT, -- high, medium, standard
  file_format TEXT, -- PDF, JPEG, TIFF, etc.
  file_size_mb NUMERIC,
  pages_count INTEGER NOT NULL,
  ocr_processed BOOLEAN DEFAULT false,
  
  -- Fichiers numériques
  pdf_url TEXT,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  
  -- Métadonnées héritées (dénormalisées pour performance)
  title TEXT NOT NULL,
  title_ar TEXT,
  author TEXT,
  publication_year INTEGER,
  document_type TEXT,
  
  -- Collections et thématiques de la bibliothèque numérique
  digital_collections TEXT[], -- Collections virtuelles
  themes TEXT[], -- Thématiques
  language TEXT,
  
  -- Accès numérique
  access_level TEXT DEFAULT 'public', -- public, restricted, confidential
  requires_authentication BOOLEAN DEFAULT false,
  download_enabled BOOLEAN DEFAULT true,
  print_enabled BOOLEAN DEFAULT true,
  
  -- Statistiques
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  -- Type spécifique (pour distinguer manuscrits)
  is_manuscript BOOLEAN DEFAULT false,
  manuscript_id UUID, -- Lien vers manuscripts si applicable
  
  -- Statut de publication
  publication_status TEXT DEFAULT 'published', -- draft, published, archived
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. Mise à jour de la table manuscripts existante
-- Les manuscrits sont un sous-ensemble spécialisé de la bibliothèque numérique
ALTER TABLE IF EXISTS public.manuscripts 
ADD COLUMN IF NOT EXISTS digital_library_document_id UUID,
ADD COLUMN IF NOT EXISTS cbn_document_id UUID;

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

-- CBM Catalog
CREATE INDEX IF NOT EXISTS idx_cbm_catalog_source_library ON public.cbm_catalog(source_library);
CREATE INDEX IF NOT EXISTS idx_cbm_catalog_library_code ON public.cbm_catalog(library_code);
CREATE INDEX IF NOT EXISTS idx_cbm_catalog_cbn_document ON public.cbm_catalog(cbn_document_id);
CREATE INDEX IF NOT EXISTS idx_cbm_catalog_record_id ON public.cbm_catalog(cbm_record_id);

-- CBN Documents
CREATE INDEX IF NOT EXISTS idx_cbn_documents_cote ON public.cbn_documents(cote);
CREATE INDEX IF NOT EXISTS idx_cbn_documents_cbm_catalog ON public.cbn_documents(cbm_catalog_id);
CREATE INDEX IF NOT EXISTS idx_cbn_documents_digital_library ON public.cbn_documents(digital_library_document_id);
CREATE INDEX IF NOT EXISTS idx_cbn_documents_type ON public.cbn_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_cbn_documents_digitized ON public.cbn_documents(is_digitized);

-- Digital Library Documents
CREATE INDEX IF NOT EXISTS idx_digital_library_cbn_document ON public.digital_library_documents(cbn_document_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_manuscript ON public.digital_library_documents(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_digital_library_status ON public.digital_library_documents(publication_status);
CREATE INDEX IF NOT EXISTS idx_digital_library_is_manuscript ON public.digital_library_documents(is_manuscript);

-- Manuscripts
CREATE INDEX IF NOT EXISTS idx_manuscripts_digital_library ON public.manuscripts(digital_library_document_id);
CREATE INDEX IF NOT EXISTS idx_manuscripts_cbn_document ON public.manuscripts(cbn_document_id);

-- =====================================================
-- CONTRAINTES DE CLÉS ÉTRANGÈRES
-- =====================================================

-- CBM Catalog -> CBN Documents
ALTER TABLE public.cbm_catalog
ADD CONSTRAINT fk_cbm_catalog_cbn_document
FOREIGN KEY (cbn_document_id) REFERENCES public.cbn_documents(id)
ON DELETE SET NULL;

-- CBN Documents -> CBM Catalog
ALTER TABLE public.cbn_documents
ADD CONSTRAINT fk_cbn_documents_cbm_catalog
FOREIGN KEY (cbm_catalog_id) REFERENCES public.cbm_catalog(id)
ON DELETE SET NULL;

-- CBN Documents -> Digital Library
ALTER TABLE public.cbn_documents
ADD CONSTRAINT fk_cbn_documents_digital_library
FOREIGN KEY (digital_library_document_id) REFERENCES public.digital_library_documents(id)
ON DELETE SET NULL;

-- Digital Library -> CBN Documents
ALTER TABLE public.digital_library_documents
ADD CONSTRAINT fk_digital_library_cbn_document
FOREIGN KEY (cbn_document_id) REFERENCES public.cbn_documents(id)
ON DELETE CASCADE;

-- Digital Library -> Manuscripts
ALTER TABLE public.digital_library_documents
ADD CONSTRAINT fk_digital_library_manuscript
FOREIGN KEY (manuscript_id) REFERENCES public.manuscripts(id)
ON DELETE SET NULL;

-- Manuscripts -> Digital Library
ALTER TABLE public.manuscripts
ADD CONSTRAINT fk_manuscripts_digital_library
FOREIGN KEY (digital_library_document_id) REFERENCES public.digital_library_documents(id)
ON DELETE SET NULL;

-- Manuscripts -> CBN Documents
ALTER TABLE public.manuscripts
ADD CONSTRAINT fk_manuscripts_cbn_document
FOREIGN KEY (cbn_document_id) REFERENCES public.cbn_documents(id)
ON DELETE SET NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- CBM Catalog - Lecture publique
ALTER TABLE public.cbm_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les documents CBM non supprimés"
ON public.cbm_catalog FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Admins peuvent gérer le catalogue CBM"
ON public.cbm_catalog FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- CBN Documents - Lecture publique pour documents publics
ALTER TABLE public.cbn_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les documents CBN publics non supprimés"
ON public.cbn_documents FOR SELECT
USING (deleted_at IS NULL AND (access_level = 'public' OR is_admin_or_librarian(auth.uid())));

CREATE POLICY "Admins peuvent gérer les documents CBN"
ON public.cbn_documents FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Digital Library Documents
ALTER TABLE public.digital_library_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les documents publiés de la bibliothèque numérique"
ON public.digital_library_documents FOR SELECT
USING (
  deleted_at IS NULL 
  AND publication_status = 'published'
  AND (access_level = 'public' OR is_admin_or_librarian(auth.uid()))
);

CREATE POLICY "Admins peuvent gérer les documents de la bibliothèque numérique"
ON public.digital_library_documents FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- =====================================================
-- TRIGGERS POUR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cbm_catalog_updated_at BEFORE UPDATE ON public.cbm_catalog
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cbn_documents_updated_at BEFORE UPDATE ON public.cbn_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_library_documents_updated_at BEFORE UPDATE ON public.digital_library_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();