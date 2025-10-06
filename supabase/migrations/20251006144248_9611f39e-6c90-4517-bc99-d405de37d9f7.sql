-- Table pour les abonnements aux services
CREATE TABLE IF NOT EXISTS service_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES bnrm_services(id_service) ON DELETE CASCADE,
  tariff_id TEXT NOT NULL REFERENCES bnrm_tarifs(id_tarif) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending_payment')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MAD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table pour les inscriptions aux services
CREATE TABLE IF NOT EXISTS service_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES bnrm_services(id_service) ON DELETE CASCADE,
  tariff_id TEXT REFERENCES bnrm_tarifs(id_tarif) ON DELETE SET NULL,
  subscription_id UUID REFERENCES service_subscriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  is_paid BOOLEAN DEFAULT false,
  registration_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- Table pour les notifications de paiement
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES service_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('payment_due', 'payment_overdue', 'subscription_expiring')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  days_before_due INTEGER,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_user_id ON service_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_service_subscriptions_status ON service_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_service_registrations_user_id ON service_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_user_id ON payment_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_subscription_id ON payment_reminders(subscription_id);

-- Fonction pour calculer la date de fin d'abonnement
CREATE OR REPLACE FUNCTION calculate_subscription_end_date(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_subscription_type TEXT
)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_subscription_type = 'monthly' THEN
    RETURN p_start_date + INTERVAL '1 month';
  ELSIF p_subscription_type = 'annual' THEN
    RETURN p_start_date + INTERVAL '1 year';
  ELSE
    RAISE EXCEPTION 'Invalid subscription type: %', p_subscription_type;
  END IF;
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_service_subscriptions_updated_at
  BEFORE UPDATE ON service_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

CREATE TRIGGER update_service_registrations_updated_at
  BEFORE UPDATE ON service_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- RLS Policies pour service_subscriptions
ALTER TABLE service_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON service_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON service_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON service_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON service_subscriptions FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour service_registrations
ALTER TABLE service_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations"
  ON service_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations"
  ON service_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations"
  ON service_registrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all registrations"
  ON service_registrations FOR ALL
  USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies pour payment_reminders
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
  ON payment_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create reminders"
  ON payment_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own reminders"
  ON payment_reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reminders"
  ON payment_reminders FOR ALL
  USING (is_admin_or_librarian(auth.uid()));