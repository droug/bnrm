-- Assigner le rôle validateur à Younes EL FADDI dans user_system_roles
INSERT INTO public.user_system_roles (user_id, role_id, is_active)
SELECT 
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid,
  id,
  true
FROM public.system_roles
WHERE role_code = 'validateur'
ON CONFLICT DO NOTHING;

-- Assigner également dans user_roles (table enum) pour compatibilité avec Edge Functions
INSERT INTO public.user_roles (user_id, role)
VALUES ('5631cc25-129d-4635-bbf3-a9eb8443f6a4'::uuid, 'validateur'::user_role)
ON CONFLICT (user_id, role) DO NOTHING;