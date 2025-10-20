-- Table pour les demandes de réservation de documents
CREATE TABLE IF NOT EXISTS public.reservations_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL,
  document_title TEXT NOT NULL,
  document_cote TEXT,
  requested_date DATE NOT NULL,
  requested_time TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'approuvee', 'rejetee', 'annulee')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reservations_requests_user_id ON public.reservations_requests(user_id);
CREATE INDEX idx_reservations_requests_document_id ON public.reservations_requests(document_id);
CREATE INDEX idx_reservations_requests_status ON public.reservations_requests(status);
CREATE INDEX idx_reservations_requests_requested_date ON public.reservations_requests(requested_date);

-- RLS Policies
ALTER TABLE public.reservations_requests ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres demandes
CREATE POLICY "Users can view their own reservation requests"
ON public.reservations_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer leurs propres demandes
CREATE POLICY "Users can create their own reservation requests"
ON public.reservations_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres demandes (uniquement annulation)
CREATE POLICY "Users can update their own reservation requests"
ON public.reservations_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Les admins peuvent tout voir et gérer
CREATE POLICY "Admins can manage all reservation requests"
ON public.reservations_requests
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_reservations_requests_updated_at
BEFORE UPDATE ON public.reservations_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();