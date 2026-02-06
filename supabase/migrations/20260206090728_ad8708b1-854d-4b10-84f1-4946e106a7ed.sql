-- Ajouter le rôle 'validateur' à l'enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'validateur';

-- Ajouter les colonnes d'arbitrage à la table legal_deposit_requests
ALTER TABLE public.legal_deposit_requests
  ADD COLUMN IF NOT EXISTS arbitration_requested BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS arbitration_requested_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS arbitration_requested_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS arbitration_reason TEXT,
  ADD COLUMN IF NOT EXISTS arbitration_status TEXT CHECK (arbitration_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS arbitration_validated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS arbitration_validated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS arbitration_decision_reason TEXT;

-- Créer un index pour les demandes en arbitrage
CREATE INDEX IF NOT EXISTS idx_legal_deposit_arbitration ON public.legal_deposit_requests(arbitration_requested, arbitration_status) WHERE arbitration_requested = TRUE;