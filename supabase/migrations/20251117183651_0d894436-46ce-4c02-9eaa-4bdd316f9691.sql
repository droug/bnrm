
-- ===================================================
-- SYSTÈME DE GESTION ÉLECTRONIQUE DES DOCUMENTS (GED)
-- Gestion centralisée de tous les documents du système
-- ===================================================

-- Table principale: ged_documents
-- Centralise TOUS les documents avec métadonnées riches
CREATE TABLE IF NOT EXISTS public.ged_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identification et classification
  document_number TEXT NOT NULL UNIQUE,
  document_type TEXT NOT NULL, -- 'legal_deposit', 'cbm', 'restoration', 'rental', 'booking', 'reproduction', etc.
  document_category TEXT, -- 'administrative', 'legal', 'technical', 'financial', 'correspondence'
  document_title TEXT NOT NULL,
  description TEXT,
  
  -- Référence au module source
  source_module TEXT NOT NULL, -- Module d'origine
  source_table TEXT, -- Table source
  source_record_id UUID, -- ID de l'enregistrement source
  
  -- Fichier et stockage
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size_bytes BIGINT,
  file_mime_type TEXT,
  file_extension TEXT,
  storage_location TEXT, -- 'supabase', 's3', 'local', 'azure'
  
  -- Versions et révisions
  version_number INTEGER DEFAULT 1,
  is_latest_version BOOLEAN DEFAULT true,
  parent_document_id UUID REFERENCES public.ged_documents(id),
  
  -- Métadonnées de sécurité
  access_level TEXT DEFAULT 'private', -- 'public', 'internal', 'restricted', 'confidential', 'private'
  confidentiality_level INTEGER DEFAULT 1, -- 1-5
  requires_signature BOOLEAN DEFAULT false,
  is_signed BOOLEAN DEFAULT false,
  signature_data JSONB,
  
  -- Gestion du cycle de vie
  status TEXT DEFAULT 'draft', -- 'draft', 'pending_review', 'approved', 'rejected', 'archived', 'deleted'
  retention_period_years INTEGER,
  archival_date TIMESTAMP WITH TIME ZONE,
  deletion_date TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées de traitement
  ocr_processed BOOLEAN DEFAULT false,
  ocr_text TEXT,
  indexed BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  preview_url TEXT,
  
  -- Workflow et validation
  workflow_status TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  
  -- Relations et contexte
  related_documents UUID[],
  tags TEXT[],
  keywords TEXT[],
  custom_metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Audit et traçabilité
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  
  -- Checksum pour intégrité
  checksum TEXT,
  
  CONSTRAINT valid_access_level CHECK (access_level IN ('public', 'internal', 'restricted', 'confidential', 'private')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived', 'deleted'))
);

-- Index pour les recherches
CREATE INDEX idx_ged_documents_number ON public.ged_documents(document_number);
CREATE INDEX idx_ged_documents_type ON public.ged_documents(document_type);
CREATE INDEX idx_ged_documents_module ON public.ged_documents(source_module);
CREATE INDEX idx_ged_documents_status ON public.ged_documents(status);
CREATE INDEX idx_ged_documents_created_by ON public.ged_documents(created_by);
CREATE INDEX idx_ged_documents_source_record ON public.ged_documents(source_table, source_record_id);
CREATE INDEX idx_ged_documents_tags ON public.ged_documents USING GIN(tags);
CREATE INDEX idx_ged_documents_keywords ON public.ged_documents USING GIN(keywords);
CREATE INDEX idx_ged_documents_ocr_text ON public.ged_documents USING GIN(to_tsvector('french', COALESCE(ocr_text, '')));

-- Table: ged_document_versions
-- Gestion de l'historique des versions
CREATE TABLE IF NOT EXISTS public.ged_document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size_bytes BIGINT,
  checksum TEXT,
  
  changes_description TEXT,
  version_notes TEXT,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(document_id, version_number)
);

CREATE INDEX idx_ged_versions_document ON public.ged_document_versions(document_id);

-- Table: ged_document_permissions
-- Permissions granulaires par document
CREATE TABLE IF NOT EXISTS public.ged_document_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  -- Permission par utilisateur ou rôle
  user_id UUID,
  role_name TEXT,
  
  -- Type de permission
  can_view BOOLEAN DEFAULT false,
  can_download BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_share BOOLEAN DEFAULT false,
  can_sign BOOLEAN DEFAULT false,
  
  -- Validité
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT permission_target CHECK (user_id IS NOT NULL OR role_name IS NOT NULL)
);

CREATE INDEX idx_ged_permissions_document ON public.ged_document_permissions(document_id);
CREATE INDEX idx_ged_permissions_user ON public.ged_document_permissions(user_id);
CREATE INDEX idx_ged_permissions_role ON public.ged_document_permissions(role_name);

-- Table: ged_document_access_log
-- Journal d'accès aux documents
CREATE TABLE IF NOT EXISTS public.ged_document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  user_id UUID,
  action TEXT NOT NULL, -- 'view', 'download', 'edit', 'delete', 'share', 'sign'
  ip_address INET,
  user_agent TEXT,
  
  access_granted BOOLEAN DEFAULT true,
  denial_reason TEXT,
  
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ged_access_log_document ON public.ged_document_access_log(document_id);
CREATE INDEX idx_ged_access_log_user ON public.ged_document_access_log(user_id);
CREATE INDEX idx_ged_access_log_action ON public.ged_document_access_log(action);
CREATE INDEX idx_ged_access_log_date ON public.ged_document_access_log(accessed_at);

-- Table: ged_document_signatures
-- Gestion des signatures électroniques
CREATE TABLE IF NOT EXISTS public.ged_document_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  signer_id UUID NOT NULL,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signer_role TEXT,
  
  signature_type TEXT NOT NULL, -- 'electronic', 'digital', 'biometric'
  signature_data JSONB NOT NULL,
  signature_certificate TEXT,
  
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  
  is_valid BOOLEAN DEFAULT true,
  validation_status TEXT,
  validated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ged_signatures_document ON public.ged_document_signatures(document_id);
CREATE INDEX idx_ged_signatures_signer ON public.ged_document_signatures(signer_id);

-- Table: ged_document_annotations
-- Annotations et commentaires sur les documents
CREATE TABLE IF NOT EXISTS public.ged_document_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  annotation_type TEXT NOT NULL, -- 'comment', 'highlight', 'note', 'stamp'
  content TEXT NOT NULL,
  
  -- Position dans le document
  page_number INTEGER,
  position_data JSONB, -- Coordonnées, zone, etc.
  
  -- Auteur
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Visibilité
  is_private BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ged_annotations_document ON public.ged_document_annotations(document_id);
CREATE INDEX idx_ged_annotations_author ON public.ged_document_annotations(created_by);

-- Table: ged_document_workflows
-- Workflows de validation des documents
CREATE TABLE IF NOT EXISTS public.ged_document_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  workflow_name TEXT NOT NULL,
  workflow_step INTEGER DEFAULT 1,
  total_steps INTEGER NOT NULL,
  
  current_assignee UUID,
  current_status TEXT DEFAULT 'pending',
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  workflow_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_ged_workflows_document ON public.ged_document_workflows(document_id);
CREATE INDEX idx_ged_workflows_assignee ON public.ged_document_workflows(current_assignee);

-- Table: ged_document_relations
-- Relations entre documents
CREATE TABLE IF NOT EXISTS public.ged_document_relations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  target_document_id UUID NOT NULL REFERENCES public.ged_documents(id) ON DELETE CASCADE,
  
  relation_type TEXT NOT NULL, -- 'attachment', 'reference', 'supersedes', 'amendment', 'annex'
  description TEXT,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_relation CHECK (source_document_id != target_document_id),
  CONSTRAINT unique_relation UNIQUE(source_document_id, target_document_id, relation_type)
);

CREATE INDEX idx_ged_relations_source ON public.ged_document_relations(source_document_id);
CREATE INDEX idx_ged_relations_target ON public.ged_document_relations(target_document_id);

-- Activer RLS sur toutes les tables
ALTER TABLE public.ged_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ged_document_relations ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ged_documents
CREATE POLICY "Les documents publics sont visibles par tous"
  ON public.ged_documents FOR SELECT
  USING (access_level = 'public');

CREATE POLICY "Les utilisateurs voient leurs propres documents"
  ON public.ged_documents FOR SELECT
  USING (created_by = auth.uid() OR access_level IN ('public', 'internal'));

CREATE POLICY "Les admins voient tous les documents"
  ON public.ged_documents FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Les utilisateurs peuvent créer des documents"
  ON public.ged_documents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Politiques pour les versions
CREATE POLICY "Visibilité versions selon document"
  ON public.ged_document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ged_documents
      WHERE id = document_id
      AND (created_by = auth.uid() OR access_level IN ('public', 'internal') OR is_admin_or_librarian(auth.uid()))
    )
  );

-- Politiques pour les permissions
CREATE POLICY "Les admins gèrent les permissions"
  ON public.ged_document_permissions FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- Politiques pour le journal d'accès
CREATE POLICY "Admins voient tous les logs"
  ON public.ged_document_access_log FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Système enregistre les accès"
  ON public.ged_document_access_log FOR INSERT
  WITH CHECK (true);

-- Politiques pour les signatures
CREATE POLICY "Visibilité signatures selon document"
  ON public.ged_document_signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ged_documents
      WHERE id = document_id
      AND (created_by = auth.uid() OR is_admin_or_librarian(auth.uid()))
    )
  );

-- Politiques pour les annotations
CREATE POLICY "Voir annotations publiques et propres"
  ON public.ged_document_annotations FOR SELECT
  USING (NOT is_private OR created_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Créer ses propres annotations"
  ON public.ged_document_annotations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Politiques pour les workflows
CREATE POLICY "Voir workflows si assigné ou admin"
  ON public.ged_document_workflows FOR SELECT
  USING (current_assignee = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- Politiques pour les relations
CREATE POLICY "Voir relations selon documents"
  ON public.ged_document_relations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ged_documents
      WHERE id = source_document_id
      AND (created_by = auth.uid() OR access_level IN ('public', 'internal') OR is_admin_or_librarian(auth.uid()))
    )
  );

-- Fonction: Générer un numéro de document
CREATE OR REPLACE FUNCTION public.generate_ged_document_number(p_document_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  year_part TEXT;
  type_prefix TEXT;
  sequence_num INTEGER;
  doc_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  -- Préfixe selon le type
  type_prefix := CASE p_document_type
    WHEN 'legal_deposit' THEN 'GED-DL'
    WHEN 'cataloging' THEN 'GED-CAT'
    WHEN 'cbm' THEN 'GED-CBM'
    WHEN 'restoration' THEN 'GED-REST'
    WHEN 'rental' THEN 'GED-LOC'
    WHEN 'booking' THEN 'GED-RES'
    WHEN 'reproduction' THEN 'GED-REP'
    WHEN 'digitization' THEN 'GED-NUM'
    WHEN 'manuscript' THEN 'GED-MAN'
    ELSE 'GED-DOC'
  END;
  
  -- Séquence
  SELECT COALESCE(MAX(CAST(SPLIT_PART(document_number, '-', 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM ged_documents
  WHERE document_number LIKE type_prefix || '-' || year_part || '-%';
  
  doc_num := type_prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN doc_num;
END;
$$;

-- Trigger: Auto-génération du numéro
CREATE OR REPLACE FUNCTION public.set_ged_document_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.document_number IS NULL THEN
    NEW.document_number := public.generate_ged_document_number(NEW.document_type);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_ged_document_number
  BEFORE INSERT ON public.ged_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_ged_document_number();

-- Trigger: updated_at
CREATE TRIGGER update_ged_documents_updated_at
  BEFORE UPDATE ON public.ged_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Commentaires
COMMENT ON TABLE public.ged_documents IS 'Système de Gestion Électronique des Documents - Table principale';
COMMENT ON TABLE public.ged_document_versions IS 'Historique des versions de documents';
COMMENT ON TABLE public.ged_document_permissions IS 'Permissions granulaires par document';
COMMENT ON TABLE public.ged_document_access_log IS 'Journal d''accès aux documents';
COMMENT ON TABLE public.ged_document_signatures IS 'Signatures électroniques des documents';
COMMENT ON TABLE public.ged_document_annotations IS 'Annotations et commentaires sur les documents';
COMMENT ON TABLE public.ged_document_workflows IS 'Workflows de validation des documents';
COMMENT ON TABLE public.ged_document_relations IS 'Relations entre documents';
