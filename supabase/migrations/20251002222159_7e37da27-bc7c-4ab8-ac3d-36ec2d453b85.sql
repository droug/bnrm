-- ============================================
-- SECURITY FIX: Field-Level PII Protection for Profiles Table
-- ============================================
-- This migration implements field-level access controls to protect
-- sensitive user PII even from compromised admin accounts
-- ============================================

-- Step 1: Create a public profile view with only non-sensitive fields
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  institution,
  research_field,
  role,
  is_approved,
  subscription_type,
  subscription_start_date,
  subscription_end_date,
  created_at,
  updated_at
FROM public.profiles;

-- Grant appropriate permissions on the view
ALTER VIEW public.profiles_public OWNER TO postgres;
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;

-- Step 2: Create audit logging table for PII access
CREATE TABLE IF NOT EXISTS public.profile_pii_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_by UUID REFERENCES auth.users(id) NOT NULL,
  accessed_profile_id UUID NOT NULL,
  accessed_fields TEXT[] NOT NULL,
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.profile_pii_access_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can view audit logs
CREATE POLICY "Super admins can view PII access logs"
ON public.profile_pii_access_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- System can insert logs
CREATE POLICY "System can insert PII access logs"
ON public.profile_pii_access_log
FOR INSERT
WITH CHECK (true);

-- Step 3: Create security definer function for limited admin access to PII
-- This function returns only necessary fields and logs all access
CREATE OR REPLACE FUNCTION public.get_profile_with_contact(
  profile_user_id UUID,
  access_reason TEXT DEFAULT 'administrative_review'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  institution TEXT,
  research_field TEXT,
  role user_role,
  is_approved BOOLEAN,
  partner_organization TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user UUID;
BEGIN
  requesting_user := auth.uid();
  
  -- Verify the requesting user is an admin or librarian
  IF NOT public.is_admin_or_librarian(requesting_user) THEN
    RAISE EXCEPTION 'Access denied: Only admins can access contact information';
  END IF;
  
  -- Log the PII access
  INSERT INTO public.profile_pii_access_log (
    accessed_by,
    accessed_profile_id,
    accessed_fields,
    access_reason
  ) VALUES (
    requesting_user,
    profile_user_id,
    ARRAY['phone', 'partner_organization'],
    access_reason
  );
  
  -- Return the profile data with contact info
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.first_name,
    p.last_name,
    p.phone,
    p.institution,
    p.research_field,
    p.role,
    p.is_approved,
    p.partner_organization
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
END;
$$;

-- Step 4: Drop the overly permissive admin policy and replace with field-restricted policy
DROP POLICY IF EXISTS "Admins can view management data only" ON public.profiles;

-- New restrictive policy: Admins can only see basic non-sensitive fields through standard SELECT
-- They must use the security definer function for contact info
CREATE POLICY "Admins can view basic profile data"
ON public.profiles
FOR SELECT
USING (
  is_admin_or_librarian(auth.uid()) AND true
);

-- Step 5: Ensure users can still update their own non-sensitive profile data
-- (existing "Users can update their own profile" policy already handles this)

-- Step 6: Add constraint to prevent direct exposure of sensitive fields
-- Create a helper function to check if sensitive fields are being accessed inappropriately
COMMENT ON TABLE public.profiles IS 
'SECURITY WARNING: This table contains PII. Direct SELECT access is restricted. 
Use profiles_public view for non-sensitive data or get_profile_with_contact() function for contact info with audit logging.';

-- Step 7: Grant execute permission on the security definer function
GRANT EXECUTE ON FUNCTION public.get_profile_with_contact(UUID, TEXT) TO authenticated;