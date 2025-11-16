-- Create RLS policies for service_registrations table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.service_registrations;
DROP POLICY IF EXISTS "Users can insert their own registrations" ON public.service_registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.service_registrations;
DROP POLICY IF EXISTS "Admins can update all registrations" ON public.service_registrations;

-- Enable RLS
ALTER TABLE public.service_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own registrations
CREATE POLICY "Users can view their own registrations"
ON public.service_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own registrations
CREATE POLICY "Users can insert their own registrations"
ON public.service_registrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
ON public.service_registrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND (expires_at IS NULL OR expires_at > now())
  )
);

-- Policy: Admins can update all registrations (approve/reject)
CREATE POLICY "Admins can update all registrations"
ON public.service_registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND (expires_at IS NULL OR expires_at > now())
  )
);