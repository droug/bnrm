-- Enum pour le statut de confirmation
DO $$ BEGIN
  CREATE TYPE public.confirmation_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table des tokens de confirmation pour le système de confirmation réciproque
CREATE TABLE public.deposit_confirmation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.legal_deposit_requests(id) ON DELETE CASCADE,
  party_type TEXT NOT NULL CHECK (party_type IN ('editor', 'printer')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  email TEXT NOT NULL,
  status public.confirmation_status NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 days'),
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Ajouter les champs de confirmation à la table legal_deposit_requests
ALTER TABLE public.legal_deposit_requests 
ADD COLUMN IF NOT EXISTS editor_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS printer_confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS editor_confirmation_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS printer_confirmation_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmation_status TEXT DEFAULT 'not_required' 
  CHECK (confirmation_status IN ('not_required', 'pending_confirmation', 'confirmed', 'rejected', 'expired'));

-- Index pour les requêtes fréquentes
CREATE INDEX idx_confirmation_tokens_request ON public.deposit_confirmation_tokens(request_id);
CREATE INDEX idx_confirmation_tokens_token ON public.deposit_confirmation_tokens(token);
CREATE INDEX idx_confirmation_tokens_user ON public.deposit_confirmation_tokens(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_confirmation_tokens_status ON public.deposit_confirmation_tokens(status) WHERE status = 'pending';
CREATE INDEX idx_legal_deposit_confirmation_status ON public.legal_deposit_requests(confirmation_status) WHERE confirmation_status = 'pending_confirmation';

-- Enable RLS
ALTER TABLE public.deposit_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Fonction security definer pour vérifier les tokens sans RLS recursion
CREATE OR REPLACE FUNCTION public.get_confirmation_token_by_token(p_token TEXT)
RETURNS TABLE (
  id UUID,
  request_id UUID,
  party_type TEXT,
  email TEXT,
  status public.confirmation_status,
  user_id UUID,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dct.id, dct.request_id, dct.party_type, dct.email, dct.status, dct.user_id, dct.expires_at
  FROM public.deposit_confirmation_tokens dct
  WHERE dct.token = p_token;
$$;

-- RLS Policies pour deposit_confirmation_tokens
CREATE POLICY "Users can view their own confirmation tokens"
ON public.deposit_confirmation_tokens
FOR SELECT
USING (
  auth.uid() = user_id 
  OR auth.uid() IN (
    SELECT initiator_id FROM public.legal_deposit_requests WHERE id = request_id
  )
);

CREATE POLICY "Admins can view all confirmation tokens"
ON public.deposit_confirmation_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'librarian')
  )
);

CREATE POLICY "System can insert confirmation tokens"
ON public.deposit_confirmation_tokens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own confirmation tokens"
ON public.deposit_confirmation_tokens
FOR UPDATE
USING (
  auth.uid() = user_id 
  OR token IS NOT NULL
);

-- Fonction pour vérifier si les deux parties ont confirmé
CREATE OR REPLACE FUNCTION public.check_deposit_confirmations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_editor_confirmed BOOLEAN;
  v_printer_confirmed BOOLEAN;
BEGIN
  SELECT 
    COALESCE(bool_or(status = 'confirmed' AND party_type = 'editor'), FALSE),
    COALESCE(bool_or(status = 'confirmed' AND party_type = 'printer'), FALSE)
  INTO v_editor_confirmed, v_printer_confirmed
  FROM public.deposit_confirmation_tokens
  WHERE request_id = NEW.request_id;
  
  IF v_editor_confirmed AND v_printer_confirmed THEN
    UPDATE public.legal_deposit_requests
    SET 
      editor_confirmed = TRUE,
      printer_confirmed = TRUE,
      confirmation_status = 'confirmed',
      status = 'submitted',
      updated_at = now()
    WHERE id = NEW.request_id;
  ELSIF NEW.status = 'rejected' THEN
    UPDATE public.legal_deposit_requests
    SET 
      confirmation_status = 'rejected',
      updated_at = now()
    WHERE id = NEW.request_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour vérifier automatiquement les confirmations
CREATE TRIGGER trigger_check_deposit_confirmations
AFTER UPDATE ON public.deposit_confirmation_tokens
FOR EACH ROW
WHEN (NEW.status IN ('confirmed', 'rejected'))
EXECUTE FUNCTION public.check_deposit_confirmations();

-- Fonction pour obtenir les confirmations en attente d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_pending_confirmations_for_user(p_user_id UUID)
RETURNS TABLE (
  token_id UUID,
  request_id UUID,
  request_number TEXT,
  title TEXT,
  party_type TEXT,
  initiator_name TEXT,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id as token_id,
    t.request_id,
    r.request_number,
    r.title,
    t.party_type,
    COALESCE(
      NULLIF(CONCAT(p.first_name, ' ', p.last_name), ' '),
      'Utilisateur'
    ) as initiator_name,
    t.created_at,
    t.expires_at
  FROM public.deposit_confirmation_tokens t
  JOIN public.legal_deposit_requests r ON r.id = t.request_id
  LEFT JOIN public.profiles p ON p.id = r.initiator_id
  WHERE t.user_id = p_user_id
    AND t.status = 'pending'
    AND t.expires_at > now();
$$;