-- Table pour les collections d'institutions partenaires
CREATE TABLE IF NOT EXISTS public.partner_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  institution_code TEXT UNIQUE NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les soumissions de manuscrits par les partenaires
CREATE TABLE IF NOT EXISTS public.partner_manuscript_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.partner_collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  language TEXT NOT NULL,
  period TEXT,
  material TEXT,
  dimensions TEXT,
  condition_notes TEXT,
  inventory_number TEXT,
  page_count INTEGER,
  digital_files JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  submission_status TEXT DEFAULT 'pending' CHECK (submission_status IN ('pending', 'under_review', 'approved', 'rejected', 'revision_requested')),
  rejection_reason TEXT,
  revision_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  manuscript_id UUID REFERENCES public.manuscripts(id),
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique des révisions
CREATE TABLE IF NOT EXISTS public.partner_submission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.partner_manuscript_submissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  old_status TEXT,
  new_status TEXT,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.partner_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_manuscript_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_submission_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour partner_collections
CREATE POLICY "Admins can manage all collections"
  ON public.partner_collections FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Partners can view their own collections"
  ON public.partner_collections FOR SELECT
  USING (created_by = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Partners can create collections"
  ON public.partner_collections FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'partner'
    )
  );

CREATE POLICY "Partners can update their own collections"
  ON public.partner_collections FOR UPDATE
  USING (created_by = auth.uid() AND NOT is_approved)
  WITH CHECK (created_by = auth.uid());

-- Politiques RLS pour partner_manuscript_submissions
CREATE POLICY "Admins can manage all submissions"
  ON public.partner_manuscript_submissions FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Partners can view their own submissions"
  ON public.partner_manuscript_submissions FOR SELECT
  USING (
    submitted_by = auth.uid() OR 
    is_admin_or_librarian(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.partner_collections pc
      WHERE pc.id = partner_manuscript_submissions.collection_id
      AND pc.created_by = auth.uid()
    )
  );

CREATE POLICY "Partners can create submissions"
  ON public.partner_manuscript_submissions FOR INSERT
  WITH CHECK (
    submitted_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.partner_collections pc
      WHERE pc.id = collection_id
      AND pc.created_by = auth.uid()
      AND pc.is_approved = true
    )
  );

CREATE POLICY "Partners can update their pending submissions"
  ON public.partner_manuscript_submissions FOR UPDATE
  USING (
    submitted_by = auth.uid() AND 
    submission_status IN ('pending', 'revision_requested')
  )
  WITH CHECK (submitted_by = auth.uid());

-- Politiques RLS pour partner_submission_history
CREATE POLICY "Admins can view all history"
  ON public.partner_submission_history FOR SELECT
  USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Partners can view their submission history"
  ON public.partner_submission_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_manuscript_submissions pms
      WHERE pms.id = partner_submission_history.submission_id
      AND pms.submitted_by = auth.uid()
    )
  );

CREATE POLICY "System can insert history"
  ON public.partner_submission_history FOR INSERT
  WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_partner_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_collections_timestamp
  BEFORE UPDATE ON public.partner_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_collections_updated_at();

CREATE TRIGGER update_partner_submissions_timestamp
  BEFORE UPDATE ON public.partner_manuscript_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_collections_updated_at();

-- Index pour améliorer les performances
CREATE INDEX idx_partner_collections_created_by ON public.partner_collections(created_by);
CREATE INDEX idx_partner_collections_approved ON public.partner_collections(is_approved);
CREATE INDEX idx_partner_submissions_collection ON public.partner_manuscript_submissions(collection_id);
CREATE INDEX idx_partner_submissions_status ON public.partner_manuscript_submissions(submission_status);
CREATE INDEX idx_partner_submissions_submitted_by ON public.partner_manuscript_submissions(submitted_by);