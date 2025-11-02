-- Mise à jour de la table restoration_requests pour le workflow complet
-- Ajout des nouveaux statuts
ALTER TABLE public.restoration_requests DROP CONSTRAINT IF EXISTS restoration_requests_status_check;
ALTER TABLE public.restoration_requests ADD CONSTRAINT restoration_requests_status_check 
  CHECK (status IN (
    'soumise',
    'en_attente_autorisation',
    'autorisee',
    'refusee_direction',
    'oeuvre_recue',
    'diagnostic_en_cours',
    'devis_en_attente',
    'devis_accepte',
    'devis_refuse',
    'paiement_en_attente',
    'paiement_valide',
    'restauration_en_cours',
    'terminee',
    'cloturee',
    'annulee'
  ));

-- Ajout des nouveaux champs pour le workflow
ALTER TABLE public.restoration_requests 
  ADD COLUMN IF NOT EXISTS director_approval_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS director_approval_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS director_approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS director_rejection_reason TEXT,
  
  ADD COLUMN IF NOT EXISTS artwork_received_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS artwork_received_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS artwork_condition_at_reception TEXT,
  
  ADD COLUMN IF NOT EXISTS diagnosis_completed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS diagnosis_completed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS diagnosis_report TEXT,
  ADD COLUMN IF NOT EXISTS diagnosis_photos_before JSONB DEFAULT '[]',
  
  ADD COLUMN IF NOT EXISTS quote_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS quote_issued_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS quote_accepted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS quote_rejected_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS quote_rejection_reason TEXT,
  
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS payment_validated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  
  ADD COLUMN IF NOT EXISTS restoration_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS restoration_completed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS restoration_report TEXT,
  ADD COLUMN IF NOT EXISTS restoration_photos_after JSONB DEFAULT '[]',
  
  ADD COLUMN IF NOT EXISTS artwork_returned_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS artwork_returned_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS return_notes TEXT,
  
  ADD COLUMN IF NOT EXISTS authorization_document_url TEXT,
  ADD COLUMN IF NOT EXISTS reception_document_url TEXT,
  ADD COLUMN IF NOT EXISTS diagnosis_document_url TEXT,
  ADD COLUMN IF NOT EXISTS quote_document_url TEXT,
  ADD COLUMN IF NOT EXISTS invoice_document_url TEXT,
  ADD COLUMN IF NOT EXISTS restoration_report_document_url TEXT,
  ADD COLUMN IF NOT EXISTS return_document_url TEXT;

-- Créer une table pour les historiques de statuts
CREATE TABLE IF NOT EXISTS public.restoration_request_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.restoration_requests(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on history table
ALTER TABLE public.restoration_request_history ENABLE ROW LEVEL SECURITY;

-- Policies for history table
CREATE POLICY "Admins and librarians can view restoration history" 
ON public.restoration_request_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

CREATE POLICY "System can insert restoration history" 
ON public.restoration_request_history 
FOR INSERT 
WITH CHECK (true);

-- Créer une table pour les documents associés aux demandes
CREATE TABLE IF NOT EXISTS public.restoration_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.restoration_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'autorisation',
    'reception',
    'diagnostic',
    'devis',
    'facture',
    'rapport_restauration',
    'bon_livraison',
    'decharge_restitution',
    'photo_avant',
    'photo_apres',
    'autre'
  )),
  document_url TEXT NOT NULL,
  document_name TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on documents table
ALTER TABLE public.restoration_documents ENABLE ROW LEVEL SECURITY;

-- Policies for documents table
CREATE POLICY "Users can view documents for their requests" 
ON public.restoration_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.restoration_requests
    WHERE restoration_requests.id = request_id
    AND restoration_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Admins and librarians can view all restoration documents" 
ON public.restoration_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

CREATE POLICY "Admins and librarians can insert restoration documents" 
ON public.restoration_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'librarian')
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_restoration_history_request_id ON public.restoration_request_history(request_id);
CREATE INDEX IF NOT EXISTS idx_restoration_documents_request_id ON public.restoration_documents(request_id);
CREATE INDEX IF NOT EXISTS idx_restoration_documents_type ON public.restoration_documents(document_type);

-- Fonction pour enregistrer automatiquement les changements de statut
CREATE OR REPLACE FUNCTION public.track_restoration_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.restoration_request_history (
      request_id,
      previous_status,
      new_status,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      NEW.validation_notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger pour tracer les changements de statut
DROP TRIGGER IF EXISTS track_restoration_status_trigger ON public.restoration_requests;
CREATE TRIGGER track_restoration_status_trigger
AFTER UPDATE ON public.restoration_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.track_restoration_status_change();