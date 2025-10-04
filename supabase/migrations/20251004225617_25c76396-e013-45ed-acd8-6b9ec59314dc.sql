-- Critical Security Fix: Separate roles into dedicated table to prevent privilege escalation

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

-- Step 2: Security definer functions
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

-- Step 3: Migrate existing roles
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

-- Step 4: RLS Policies for user_roles (with existence checks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
    CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can grant roles') THEN
    CREATE POLICY "Only admins can grant roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can revoke roles') THEN
    CREATE POLICY "Only admins can revoke roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Only admins can modify roles') THEN
    CREATE POLICY "Only admins can modify roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Step 5: Update is_admin_or_librarian to use user_roles
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_user_primary_role(user_uuid);
$$;

-- Step 6: Drop role column with CASCADE
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Step 7: Recreate profiles_public view
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id, user_id, first_name, last_name, institution, research_field, 
  created_at, updated_at, is_approved,
  public.get_user_primary_role(user_id) as role
FROM public.profiles;

-- Step 8: Recreate dropped policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profile_pii_access_log' AND policyname = 'Super admins can view PII access logs') THEN
    CREATE POLICY "Super admins can view PII access logs" ON public.profile_pii_access_log FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partner_collections' AND policyname = 'Partners can create collections') THEN
    CREATE POLICY "Partners can create collections" ON public.partner_collections FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'partner') OR public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'Admins can view all newsletter subscribers') THEN
    CREATE POLICY "Admins can view all newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers' AND policyname = 'Admins can manage newsletter subscribers') THEN
    CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  
  -- Update profiles policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own basic profile') THEN
    CREATE POLICY "Users can update their own basic profile" ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (
      auth.uid() = user_id AND
      is_approved = (SELECT is_approved FROM profiles WHERE user_id = auth.uid()) AND
      (subscription_type = (SELECT subscription_type FROM profiles WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    );
  END IF;
END $$;