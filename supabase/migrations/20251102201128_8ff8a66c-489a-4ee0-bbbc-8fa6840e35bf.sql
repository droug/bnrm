-- Table pour les notifications de restauration
CREATE TABLE IF NOT EXISTS public.restoration_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.restoration_requests(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'request_received',
    'request_authorized',
    'request_rejected',
    'provide_artwork',
    'quote_sent',
    'quote_accepted',
    'quote_rejected',
    'payment_link',
    'restoration_started',
    'restoration_completed',
    'artwork_ready'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_restoration_notifications_recipient ON public.restoration_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_restoration_notifications_request ON public.restoration_notifications(request_id);
CREATE INDEX IF NOT EXISTS idx_restoration_notifications_is_read ON public.restoration_notifications(is_read);

-- RLS policies
ALTER TABLE public.restoration_notifications ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own restoration notifications"
  ON public.restoration_notifications
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update their own restoration notifications"
  ON public.restoration_notifications
  FOR UPDATE
  USING (auth.uid() = recipient_id);

-- Les admins peuvent créer des notifications
CREATE POLICY "Admins can create restoration notifications"
  ON public.restoration_notifications
  FOR INSERT
  WITH CHECK (public.is_admin_or_librarian(auth.uid()));

-- Fonction pour créer une notification de restauration
CREATE OR REPLACE FUNCTION public.create_restoration_notification(
  p_request_id UUID,
  p_recipient_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.restoration_notifications (
    request_id,
    recipient_id,
    notification_type,
    title,
    message
  ) VALUES (
    p_request_id,
    p_recipient_id,
    p_notification_type,
    p_title,
    p_message
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;