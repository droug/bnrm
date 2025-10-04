-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can view all subscribers
CREATE POLICY "Admins can view all newsletter subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'librarian')
    )
  );

-- Admins can manage subscribers
CREATE POLICY "Admins can manage newsletter subscribers"
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'librarian')
    )
  );

-- System can insert new subscribers (via edge function)
CREATE POLICY "System can insert newsletter subscribers"
  ON public.newsletter_subscribers
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- System can update subscribers (via edge function)
CREATE POLICY "System can update newsletter subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO service_role
  USING (true);

-- Add comments
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores newsletter subscription information';
COMMENT ON COLUMN public.newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN public.newsletter_subscribers.is_active IS 'Whether the subscription is currently active';
COMMENT ON COLUMN public.newsletter_subscribers.subscribed_at IS 'When the user first subscribed';
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribed_at IS 'When the user unsubscribed (if applicable)';