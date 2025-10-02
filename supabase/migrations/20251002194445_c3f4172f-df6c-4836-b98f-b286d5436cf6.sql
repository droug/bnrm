-- Enum pour les types de reproduction
CREATE TYPE reproduction_modality AS ENUM ('papier', 'numerique_mail', 'numerique_espace', 'support_physique');

-- Enum pour les formats de reproduction
CREATE TYPE reproduction_format AS ENUM ('pdf', 'jpeg', 'tiff', 'png');

-- Enum pour les statuts de demande de reproduction
CREATE TYPE reproduction_status AS ENUM (
  'brouillon',
  'soumise',
  'en_validation_service',
  'validee_service',
  'en_validation_responsable',
  'approuvee',
  'refusee',
  'en_attente_paiement',
  'paiement_recu',
  'en_traitement',
  'terminee',
  'disponible',
  'expiree'
);

-- Enum pour les types de paiement
CREATE TYPE payment_method AS ENUM ('carte_bancaire', 'virement', 'especes', 'cheque');

-- Table des demandes de reproduction
CREATE TABLE public.reproduction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Modalité de reproduction
  reproduction_modality reproduction_modality NOT NULL,
  
  -- Statut et workflow
  status reproduction_status NOT NULL DEFAULT 'brouillon',
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  -- Validation service
  service_validator_id UUID REFERENCES auth.users(id),
  service_validated_at TIMESTAMP WITH TIME ZONE,
  service_validation_notes TEXT,
  
  -- Validation responsable
  manager_validator_id UUID REFERENCES auth.users(id),
  manager_validated_at TIMESTAMP WITH TIME ZONE,
  manager_validation_notes TEXT,
  
  -- Refus
  rejection_reason TEXT,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  
  -- Paiement
  payment_method payment_method,
  payment_amount NUMERIC(10, 2),
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Traitement
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  
  -- Mise à disposition
  available_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  
  -- Justificatifs
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  
  -- Notes et métadonnées
  user_notes TEXT,
  internal_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des éléments à reproduire dans chaque demande
CREATE TABLE public.reproduction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.reproduction_requests(id) ON DELETE CASCADE,
  
  -- Référence au document
  content_id UUID REFERENCES public.content(id),
  manuscript_id UUID REFERENCES public.manuscripts(id),
  
  -- Détails de l'élément
  title TEXT NOT NULL,
  reference TEXT,
  
  -- Spécifications de reproduction
  formats reproduction_format[] NOT NULL DEFAULT ARRAY['pdf']::reproduction_format[],
  pages_specification TEXT, -- ex: "1-10, 25-30"
  color_mode TEXT DEFAULT 'couleur', -- couleur, noir_blanc, niveaux_gris
  resolution_dpi INTEGER DEFAULT 300,
  
  -- Quantité (pour reproduction papier)
  quantity INTEGER DEFAULT 1,
  
  -- Prix unitaire et total
  unit_price NUMERIC(10, 2),
  total_price NUMERIC(10, 2),
  
  -- Fichiers produits
  output_files JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour le workflow de validation
CREATE TABLE public.reproduction_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.reproduction_requests(id) ON DELETE CASCADE,
  
  step_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  status TEXT DEFAULT 'en_attente',
  
  validator_id UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE public.reproduction_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.reproduction_requests(id) ON DELETE CASCADE,
  
  amount NUMERIC(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  
  transaction_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications de reproduction
CREATE TABLE public.reproduction_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.reproduction_requests(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reproduction_requests_user_id ON public.reproduction_requests(user_id);
CREATE INDEX idx_reproduction_requests_status ON public.reproduction_requests(status);
CREATE INDEX idx_reproduction_requests_request_number ON public.reproduction_requests(request_number);
CREATE INDEX idx_reproduction_items_request_id ON public.reproduction_items(request_id);
CREATE INDEX idx_reproduction_workflow_request_id ON public.reproduction_workflow_steps(request_id);
CREATE INDEX idx_reproduction_payments_request_id ON public.reproduction_payments(request_id);
CREATE INDEX idx_reproduction_notifications_recipient ON public.reproduction_notifications(recipient_id);

-- Fonction pour générer le numéro de demande
CREATE OR REPLACE FUNCTION generate_reproduction_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  request_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(request_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM reproduction_requests
  WHERE request_number LIKE 'REP-' || year_part || '-%';
  
  request_num := 'REP-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN request_num;
END;
$$;

-- Trigger pour générer automatiquement le numéro de demande
CREATE OR REPLACE FUNCTION set_reproduction_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_reproduction_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_reproduction_request
  BEFORE INSERT ON public.reproduction_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_reproduction_request_number();

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_reproduction_requests_updated_at
  BEFORE UPDATE ON public.reproduction_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le montant total d'une demande
CREATE OR REPLACE FUNCTION calculate_reproduction_total(request_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_price), 0)
  FROM reproduction_items
  WHERE request_id = request_uuid;
$$;

-- RLS Policies pour reproduction_requests
ALTER TABLE public.reproduction_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reproduction requests"
  ON public.reproduction_requests FOR SELECT
  USING (user_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can create reproduction requests"
  ON public.reproduction_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their draft requests"
  ON public.reproduction_requests FOR UPDATE
  USING (user_id = auth.uid() AND status = 'brouillon');

CREATE POLICY "Admins and librarians can manage all reproduction requests"
  ON public.reproduction_requests FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour reproduction_items
ALTER TABLE public.reproduction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their requests"
  ON public.reproduction_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reproduction_requests
      WHERE reproduction_requests.id = reproduction_items.request_id
      AND (reproduction_requests.user_id = auth.uid() OR is_admin_or_librarian(auth.uid()))
    )
  );

CREATE POLICY "Users can manage items in their draft requests"
  ON public.reproduction_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM reproduction_requests
      WHERE reproduction_requests.id = reproduction_items.request_id
      AND reproduction_requests.user_id = auth.uid()
      AND reproduction_requests.status = 'brouillon'
    )
  );

CREATE POLICY "Admins can manage all reproduction items"
  ON public.reproduction_items FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour reproduction_workflow_steps
ALTER TABLE public.reproduction_workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and admins can view workflow steps"
  ON public.reproduction_workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reproduction_requests
      WHERE reproduction_requests.id = reproduction_workflow_steps.request_id
      AND (reproduction_requests.user_id = auth.uid() OR is_admin_or_librarian(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage workflow steps"
  ON public.reproduction_workflow_steps FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour reproduction_payments
ALTER TABLE public.reproduction_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments"
  ON public.reproduction_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reproduction_requests
      WHERE reproduction_requests.id = reproduction_payments.request_id
      AND (reproduction_requests.user_id = auth.uid() OR is_admin_or_librarian(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage payments"
  ON public.reproduction_payments FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour reproduction_notifications
ALTER TABLE public.reproduction_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
  ON public.reproduction_notifications FOR SELECT
  USING (recipient_id = auth.uid() OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can update their notifications"
  ON public.reproduction_notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.reproduction_notifications FOR INSERT
  WITH CHECK (true);