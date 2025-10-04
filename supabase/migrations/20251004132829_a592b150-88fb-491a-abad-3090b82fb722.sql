-- Créer un enum pour les rôles de la plateforme manuscrits
CREATE TYPE public.manuscript_platform_role AS ENUM ('viewer', 'contributor', 'editor', 'admin');

-- Table des utilisateurs de la plateforme manuscrits
CREATE TABLE public.manuscript_platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role manuscript_platform_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.manuscript_platform_users ENABLE ROW LEVEL SECURITY;

-- Security definer function to check manuscript platform role
CREATE OR REPLACE FUNCTION public.has_manuscript_role(_user_id UUID, _role manuscript_platform_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.manuscript_platform_users
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Security definer function to check if user is manuscript admin
CREATE OR REPLACE FUNCTION public.is_manuscript_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.manuscript_platform_users
    WHERE user_id = _user_id
      AND role = 'admin'
      AND is_active = true
  )
$$;

-- RLS Policies
CREATE POLICY "Manuscript admins can view all platform users"
ON public.manuscript_platform_users
FOR SELECT
TO authenticated
USING (is_manuscript_admin(auth.uid()));

CREATE POLICY "Manuscript admins can insert platform users"
ON public.manuscript_platform_users
FOR INSERT
TO authenticated
WITH CHECK (is_manuscript_admin(auth.uid()));

CREATE POLICY "Manuscript admins can update platform users"
ON public.manuscript_platform_users
FOR UPDATE
TO authenticated
USING (is_manuscript_admin(auth.uid()));

CREATE POLICY "Manuscript admins can delete platform users"
ON public.manuscript_platform_users
FOR DELETE
TO authenticated
USING (is_manuscript_admin(auth.uid()));

CREATE POLICY "Users can view their own manuscript platform access"
ON public.manuscript_platform_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_manuscript_platform_users_updated_at
BEFORE UPDATE ON public.manuscript_platform_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example users (tous les admins et librarians existants deviennent admins de la plateforme)
INSERT INTO public.manuscript_platform_users (user_id, role, created_by)
SELECT user_id, 'admin', user_id
FROM public.profiles
WHERE role IN ('admin', 'librarian')
  AND is_approved = true
ON CONFLICT (user_id) DO NOTHING;