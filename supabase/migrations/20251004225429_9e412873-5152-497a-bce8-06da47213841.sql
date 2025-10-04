-- Step 1: Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    granted_by uuid REFERENCES auth.users(id),
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Step 3: Create function to get primary user role
CREATE OR REPLACE FUNCTION public.get_user_primary_role(_user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'librarian' THEN 2
      WHEN 'partner' THEN 3
      WHEN 'researcher' THEN 4
      WHEN 'subscriber' THEN 5
      ELSE 6
    END
  LIMIT 1
$$;

-- Step 4: Migrate existing roles to user_roles (if role column still exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    INSERT INTO public.user_roles (user_id, role, granted_at)
    SELECT user_id, role, created_at
    FROM public.profiles
    WHERE role IS NOT NULL
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;

-- Step 5: RLS Policies for user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can grant roles'
  ) THEN
    CREATE POLICY "Only admins can grant roles"
    ON public.user_roles FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can revoke roles'
  ) THEN
    CREATE POLICY "Only admins can revoke roles"
    ON public.user_roles FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can modify roles'
  ) THEN
    CREATE POLICY "Only admins can modify roles"
    ON public.user_roles FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Step 6: Update is_admin_or_librarian function (use CREATE OR REPLACE to avoid dependency issues)
CREATE OR REPLACE FUNCTION public.is_admin_or_librarian(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = user_uuid 
    AND ur.role IN ('admin', 'librarian')
    AND p.is_approved = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- Step 7: Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_primary_role(user_uuid);
$$;

-- Step 8: Drop the old role column with CASCADE (now that functions are updated)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 9: Recreate the profiles_public view
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  first_name,
  last_name,
  institution,
  research_field,
  created_at,
  updated_at,
  is_approved,
  public.get_user_primary_role(user_id) as role
FROM public.profiles;

-- Step 10: Recreate policies that depended on role column

-- Recreate policy for profile_pii_access_log
DROP POLICY IF EXISTS "Super admins can view PII access logs" ON public.profile_pii_access_log;
CREATE POLICY "Super admins can view PII access logs"
ON public.profile_pii_access_log FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Recreate policies for partner_collections
DROP POLICY IF EXISTS "Partners can create collections" ON public.partner_collections;
CREATE POLICY "Partners can create collections"
ON public.partner_collections FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'partner') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Recreate policies for newsletter_subscribers
DROP POLICY IF EXISTS "Admins can view all newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view all newsletter subscribers"
ON public.newsletter_subscribers FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter subscribers"
ON public.newsletter_subscribers FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Step 11: Update profiles RLS policy to prevent self-modification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own basic profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  is_approved = (SELECT is_approved FROM profiles WHERE user_id = auth.uid()) AND
  (subscription_type = (SELECT subscription_type FROM profiles WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);