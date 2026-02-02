-- Ajouter le rôle admin à l'utilisateur useryouness@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;