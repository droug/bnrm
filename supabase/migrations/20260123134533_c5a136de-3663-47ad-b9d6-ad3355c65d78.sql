-- Create analytics_events table for internal tracking and reporting
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL DEFAULT 'page_view',
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value INTEGER,
  page_path TEXT NOT NULL,
  page_title TEXT,
  user_id UUID,
  session_id TEXT,
  platform TEXT NOT NULL DEFAULT 'portail',
  device_type TEXT,
  browser TEXT,
  country TEXT,
  language TEXT,
  referrer TEXT,
  custom_dimensions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_platform ON public.analytics_events (platform);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON public.analytics_events (page_path);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_platform ON public.analytics_events (created_at, platform);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy for inserting events (allow anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Policy for reading events (admin role only)
CREATE POLICY "Admins can view analytics events"
ON public.analytics_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND (user_roles.expires_at IS NULL OR user_roles.expires_at > now())
  )
);

-- Comment on table
COMMENT ON TABLE public.analytics_events IS 'Stores analytics events for internal tracking and reporting (GA4/Matomo hybrid)';