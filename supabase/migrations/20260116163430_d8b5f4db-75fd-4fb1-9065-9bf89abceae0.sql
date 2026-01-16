-- Drop existing INSERT policy if exists
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.professional_registration_requests;
DROP POLICY IF EXISTS "Public can insert registration requests" ON public.professional_registration_requests;
DROP POLICY IF EXISTS "Authenticated users can insert registration requests" ON public.professional_registration_requests;

-- Create policy to allow anyone to submit registration requests (no auth required)
CREATE POLICY "Anyone can submit registration requests" 
ON public.professional_registration_requests 
FOR INSERT 
WITH CHECK (true);

-- Ensure RLS is enabled but allows public inserts
ALTER TABLE public.professional_registration_requests ENABLE ROW LEVEL SECURITY;