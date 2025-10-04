-- Module E-payment pour BNRM - Création des nouvelles tables

-- Nouveaux types d'énumération (seulement ceux qui n'existent pas)
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

CREATE TYPE transaction_type AS ENUM (
  'reproduction',
  'subscription',
  'legal_deposit',
  'service_bnrm',
  'recharge_wallet'
);

-- Table des wallets BNRM
CREATE TABLE bnrm_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  currency TEXT DEFAULT 'MAD' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table des transactions de paiement
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'MAD' NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  transaction_type transaction_type NOT NULL,
  
  -- Références aux ressources
  reproduction_request_id UUID REFERENCES reproduction_requests(id) ON DELETE SET NULL,
  legal_deposit_id UUID REFERENCES legal_deposits(id) ON DELETE SET NULL,
  
  -- Informations de paiement
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  cmi_reference TEXT,
  
  -- Sécurité et conformité
  ip_address INET,
  user_agent TEXT,
  fraud_score INTEGER CHECK (fraud_score BETWEEN 0 AND 100),
  is_3d_secure BOOLEAN DEFAULT false,
  
  -- Métadonnées
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  
  -- Dates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des recharges wallet
CREATE TABLE wallet_recharges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES bnrm_wallets(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  status payment_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Table des utilisations wallet
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES bnrm_wallets(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  transaction_type TEXT NOT NULL,
  reference_id UUID,
  description TEXT,
  balance_before NUMERIC(10, 2) NOT NULL,
  balance_after NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des logs de fraude
CREATE TABLE fraud_detection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fraud_indicators JSONB DEFAULT '{}',
  risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(payment_status);
CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_stripe_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_bnrm_wallets_user ON bnrm_wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- Fonction pour générer un numéro de transaction
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  trans_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SPLIT_PART(transaction_number, '-', 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM payment_transactions
  WHERE transaction_number LIKE 'PAY-' || year_part || '-%';
  
  trans_num := 'PAY-' || year_part || '-' || LPAD(sequence_num::TEXT, 8, '0');
  
  RETURN trans_num;
END;
$$;

-- Trigger pour numéro de transaction
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_payment_transaction
BEFORE INSERT ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION set_transaction_number();

-- Fonction pour mettre à jour le wallet
CREATE OR REPLACE FUNCTION update_wallet_balance(
  p_wallet_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance NUMERIC;
  new_balance NUMERIC;
  transaction_id UUID;
BEGIN
  SELECT balance INTO current_balance
  FROM bnrm_wallets
  WHERE id = p_wallet_id
  FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  new_balance := current_balance + p_amount;
  
  IF new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  UPDATE bnrm_wallets
  SET balance = new_balance, updated_at = NOW()
  WHERE id = p_wallet_id;
  
  INSERT INTO wallet_transactions (
    wallet_id,
    amount,
    transaction_type,
    reference_id,
    description,
    balance_before,
    balance_after
  ) VALUES (
    p_wallet_id,
    p_amount,
    p_transaction_type,
    p_reference_id,
    p_description,
    current_balance,
    new_balance
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$;

-- Triggers pour updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bnrm_wallets_updated_at
BEFORE UPDATE ON bnrm_wallets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE bnrm_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_recharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_detection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
ON bnrm_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
ON bnrm_wallets FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "System can manage wallets"
ON bnrm_wallets FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can view their own transactions"
ON payment_transactions FOR SELECT
USING (auth.uid() = user_id OR is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can create transactions"
ON payment_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
ON payment_transactions FOR ALL
USING (is_admin_or_librarian(auth.uid()));

CREATE POLICY "Users can view their wallet transactions"
ON wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bnrm_wallets
    WHERE bnrm_wallets.id = wallet_transactions.wallet_id
    AND bnrm_wallets.user_id = auth.uid()
  ) OR is_admin_or_librarian(auth.uid())
);

CREATE POLICY "Only admins can view fraud logs"
ON fraud_detection_logs FOR SELECT
USING (is_admin_or_librarian(auth.uid()));