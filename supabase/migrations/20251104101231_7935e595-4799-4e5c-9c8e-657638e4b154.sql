-- Table pour stocker les paramètres du cookie banner
CREATE TABLE IF NOT EXISTS public.cookie_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Nous utilisons des cookies',
  message TEXT NOT NULL DEFAULT 'Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser le contenu. En cliquant sur "Accepter tous les cookies", vous acceptez notre utilisation des cookies.',
  accept_button_text TEXT NOT NULL DEFAULT 'Accepter tous les cookies',
  reject_button_text TEXT NOT NULL DEFAULT 'Refuser',
  settings_button_text TEXT NOT NULL DEFAULT 'Paramètres',
  privacy_policy_url TEXT DEFAULT '/privacy-policy',
  cookie_policy_url TEXT DEFAULT '/cookie-policy',
  enabled BOOLEAN NOT NULL DEFAULT true,
  show_settings_button BOOLEAN NOT NULL DEFAULT true,
  position TEXT NOT NULL DEFAULT 'bottom' CHECK (position IN ('top', 'bottom')),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Une seule configuration active (on supprime la contrainte unique car elle empêche l'insertion)
-- On autorise plusieurs lignes mais on utilisera toujours la première

-- Insert default configuration
INSERT INTO public.cookie_settings (
  title,
  message,
  accept_button_text,
  reject_button_text,
  settings_button_text,
  privacy_policy_url,
  cookie_policy_url,
  enabled,
  show_settings_button,
  position,
  theme
) VALUES (
  'Nous utilisons des cookies 🍪',
  'Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic du site via Google Analytics et personnaliser le contenu. Vos données sont traitées de manière sécurisée et conforme au RGPD.',
  'Accepter tous les cookies',
  'Refuser',
  'Paramètres des cookies',
  '/privacy-policy',
  '/cookie-policy',
  true,
  true,
  'bottom',
  'light'
);

-- Enable RLS
ALTER TABLE public.cookie_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read cookie settings
CREATE POLICY "Cookie settings are viewable by everyone"
  ON public.cookie_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update cookie settings (using user_roles table)
CREATE POLICY "Only admins can update cookie settings"
  ON public.cookie_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_cookie_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cookie_settings_updated_at
  BEFORE UPDATE ON public.cookie_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cookie_settings_updated_at();

-- Table pour stocker les consentements des utilisateurs (optionnel, pour audit)
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  analytics_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  functional_consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_user_id ON public.cookie_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_cookie_consents_session_id ON public.cookie_consents(session_id);

-- Enable RLS
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own consents
CREATE POLICY "Users can view their own cookie consents"
  ON public.cookie_consents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'librarian')
    )
  );

-- Policy: Anyone can insert cookie consent
CREATE POLICY "Anyone can insert cookie consent"
  ON public.cookie_consents
  FOR INSERT
  WITH CHECK (true);