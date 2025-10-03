-- Ajouter les champs de gestion pour les documents de la bibliothèque numérique
ALTER TABLE public.content
ADD COLUMN IF NOT EXISTS download_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS social_share_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_share_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS copyright_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS copyright_derogation boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_type text,
ADD COLUMN IF NOT EXISTS file_size_mb numeric;

-- Table pour restreindre les téléchargements pour certains utilisateurs
CREATE TABLE IF NOT EXISTS public.download_restrictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE CASCADE,
  restriction_type text NOT NULL CHECK (restriction_type IN ('user_banned', 'abuse', 'temporary')),
  reason text,
  restricted_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.download_restrictions ENABLE ROW LEVEL SECURITY;

-- Policy pour les admins
CREATE POLICY "Admins can manage download restrictions"
ON public.download_restrictions
FOR ALL
USING (is_admin_or_librarian(auth.uid()));

-- Table pour les logs de téléchargement
CREATE TABLE IF NOT EXISTS public.download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content_id uuid REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  downloaded_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Policy pour insertion des logs
CREATE POLICY "Users can log their downloads"
ON public.download_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Policy pour consultation des logs par les admins
CREATE POLICY "Admins can view download logs"
ON public.download_logs
FOR SELECT
USING (is_admin_or_librarian(auth.uid()));

-- Fonction pour vérifier si un utilisateur peut télécharger
CREATE OR REPLACE FUNCTION public.can_user_download(p_user_id uuid, p_content_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier s'il y a une restriction active
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.download_restrictions dr
    WHERE dr.user_id = p_user_id
    AND (dr.content_id = p_content_id OR dr.content_id IS NULL)
    AND (dr.expires_at IS NULL OR dr.expires_at > NOW())
  );
END;
$$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_download_restrictions_user_id ON public.download_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_download_restrictions_content_id ON public.download_restrictions(content_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_content_id ON public.download_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON public.download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_content_copyright_expires ON public.content(copyright_expires_at) WHERE copyright_expires_at IS NOT NULL;