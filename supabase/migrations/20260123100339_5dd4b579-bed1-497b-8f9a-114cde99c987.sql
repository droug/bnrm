-- 1. Attribuer le rôle super_admin à l'utilisateur courant
INSERT INTO public.vexpo_user_roles (user_id, role, assigned_by, assigned_at)
VALUES (
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid, -- user_id (auth.users.id)
  'super_admin',
  NULL,
  now()
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Mettre à jour toutes les expositions ayant created_by NULL
UPDATE public.vexpo_exhibitions
SET created_by = '5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid
WHERE created_by IS NULL;