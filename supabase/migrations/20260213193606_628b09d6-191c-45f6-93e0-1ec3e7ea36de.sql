INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES ('5631cc25-129d-4635-bbf3-a9eb8443f6a4', 'admin', '5631cc25-129d-4635-bbf3-a9eb8443f6a4')
ON CONFLICT (user_id, role) DO NOTHING;