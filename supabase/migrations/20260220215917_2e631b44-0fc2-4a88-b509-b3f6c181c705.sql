
-- Attribuer le rôle admin à useryouness@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- S'assurer que le profil est approuvé
UPDATE public.profiles
SET is_approved = true, updated_at = NOW()
WHERE user_id = '5631cc25-129d-4635-bbf3-a9eb8443f6a4';
