-- Table pour la configuration de synchronisation SIGB
CREATE TABLE IF NOT EXISTS public.sigb_sync_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sigb_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'monthly'
  sync_time TIME DEFAULT '02:00:00', -- Heure de synchronisation
  sync_day_of_week INTEGER DEFAULT 1, -- Pour weekly: 1=lundi, 7=dimanche
  sync_day_of_month INTEGER DEFAULT 1, -- Pour monthly: 1-31
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status TEXT,
  last_sync_records_count INTEGER DEFAULT 0,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Table pour l'historique des synchronisations
CREATE TABLE IF NOT EXISTS public.sigb_sync_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.sigb_sync_config(id) ON DELETE CASCADE,
  sync_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'error'
  records_imported INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB
);

-- Enable RLS
ALTER TABLE public.sigb_sync_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sigb_sync_history ENABLE ROW LEVEL SECURITY;

-- RLS policies - only librarians and admins can manage SIGB config
CREATE POLICY "Librarians can manage SIGB config"
ON public.sigb_sync_config
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'librarian')
    AND (expires_at IS NULL OR expires_at > now())
  )
);

CREATE POLICY "Librarians can view SIGB sync history"
ON public.sigb_sync_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'librarian')
    AND (expires_at IS NULL OR expires_at > now())
  )
);

CREATE POLICY "System can insert SIGB sync history"
ON public.sigb_sync_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update SIGB sync history"
ON public.sigb_sync_history
FOR UPDATE
USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_sigb_sync_config_updated_at
BEFORE UPDATE ON public.sigb_sync_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_sigb_sync_config_active ON public.sigb_sync_config(is_active);
CREATE INDEX idx_sigb_sync_config_next_sync ON public.sigb_sync_config(next_sync_at);
CREATE INDEX idx_sigb_sync_history_config_id ON public.sigb_sync_history(config_id);
CREATE INDEX idx_sigb_sync_history_status ON public.sigb_sync_history(status);