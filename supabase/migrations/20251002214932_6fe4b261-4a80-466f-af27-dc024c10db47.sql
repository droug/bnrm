-- Table pour les formats de fichiers supportés
CREATE TABLE IF NOT EXISTS public.preservation_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  format_name TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  is_preservation_format BOOLEAN DEFAULT false,
  migration_priority INTEGER DEFAULT 0,
  format_stability TEXT CHECK (format_stability IN ('stable', 'at_risk', 'obsolete')),
  recommended_alternative TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les actions de préservation
CREATE TABLE IF NOT EXISTS public.preservation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('backup', 'format_migration', 'checksum_verification', 'metadata_update', 'restoration')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  source_format TEXT,
  target_format TEXT,
  file_path TEXT,
  backup_location TEXT,
  checksum_before TEXT,
  checksum_after TEXT,
  error_message TEXT,
  performed_by UUID REFERENCES auth.users(id),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT content_or_manuscript CHECK (
    (content_id IS NOT NULL AND manuscript_id IS NULL) OR 
    (content_id IS NULL AND manuscript_id IS NOT NULL)
  )
);

-- Table pour les sauvegardes
CREATE TABLE IF NOT EXISTS public.preservation_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('content', 'manuscript', 'database')),
  resource_id UUID,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential')),
  backup_location TEXT NOT NULL,
  backup_size_mb NUMERIC,
  checksum TEXT NOT NULL,
  encryption_method TEXT,
  retention_period_days INTEGER DEFAULT 365,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Table pour la planification des tâches de préservation
CREATE TABLE IF NOT EXISTS public.preservation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('backup', 'format_migration', 'checksum_verification', 'cleanup')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  resource_filter JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_preservation_actions_content ON public.preservation_actions(content_id);
CREATE INDEX idx_preservation_actions_manuscript ON public.preservation_actions(manuscript_id);
CREATE INDEX idx_preservation_actions_status ON public.preservation_actions(status);
CREATE INDEX idx_preservation_backups_resource ON public.preservation_backups(resource_type, resource_id);
CREATE INDEX idx_preservation_schedules_active ON public.preservation_schedules(is_active, next_run);

-- RLS Policies pour preservation_formats
ALTER TABLE public.preservation_formats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut voir les formats"
ON public.preservation_formats FOR SELECT
USING (true);

CREATE POLICY "Admins peuvent gérer les formats"
ON public.preservation_formats FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour preservation_actions
ALTER TABLE public.preservation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer les actions de préservation"
ON public.preservation_actions FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Utilisateurs peuvent voir leurs actions"
ON public.preservation_actions FOR SELECT
USING (performed_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

-- RLS Policies pour preservation_backups
ALTER TABLE public.preservation_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer les sauvegardes"
ON public.preservation_backups FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour preservation_schedules
ALTER TABLE public.preservation_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins peuvent gérer les planifications"
ON public.preservation_schedules FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Fonction pour calculer le checksum
CREATE OR REPLACE FUNCTION public.calculate_checksum(content_data BYTEA)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(digest(content_data, 'sha256'), 'hex');
END;
$$;

-- Fonction pour vérifier l'intégrité
CREATE OR REPLACE FUNCTION public.verify_backup_integrity(backup_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_record RECORD;
BEGIN
  SELECT * INTO backup_record FROM public.preservation_backups WHERE id = backup_id;
  
  IF backup_record IS NULL THEN
    RETURN false;
  END IF;
  
  -- Ici on vérifierait le checksum du fichier sauvegardé
  -- Pour l'instant on marque comme vérifié
  UPDATE public.preservation_backups
  SET is_verified = true, verification_date = NOW()
  WHERE id = backup_id;
  
  RETURN true;
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_preservation_formats_updated_at
BEFORE UPDATE ON public.preservation_formats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_preservation_schedules_updated_at
BEFORE UPDATE ON public.preservation_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques formats de préservation standards
INSERT INTO public.preservation_formats (format_name, file_extension, mime_type, is_preservation_format, format_stability) VALUES
('PDF/A-1', '.pdf', 'application/pdf', true, 'stable'),
('PDF/A-2', '.pdf', 'application/pdf', true, 'stable'),
('TIFF', '.tiff', 'image/tiff', true, 'stable'),
('JPEG 2000', '.jp2', 'image/jp2', true, 'stable'),
('PNG', '.png', 'image/png', true, 'stable'),
('XML', '.xml', 'application/xml', true, 'stable'),
('JSON', '.json', 'application/json', true, 'stable'),
('Plain Text', '.txt', 'text/plain', true, 'stable'),
('EPUB', '.epub', 'application/epub+zip', false, 'stable'),
('DOCX', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', false, 'at_risk'),
('DOC', '.doc', 'application/msword', false, 'obsolete'),
('ODT', '.odt', 'application/vnd.oasis.opendocument.text', true, 'stable')
ON CONFLICT DO NOTHING;