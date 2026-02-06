-- Assigner le rôle validateur à soufianeeljarid0@gmail.com dans les deux systèmes

-- 1. Dans user_system_roles (système dynamique)
INSERT INTO public.user_system_roles (user_id, role_id, is_active)
SELECT 
  'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0'::uuid,
  id,
  true
FROM public.system_roles
WHERE role_code = 'validateur'
ON CONFLICT DO NOTHING;

-- 2. Dans user_roles (système enum legacy pour Edge Functions)
INSERT INTO public.user_roles (user_id, role)
VALUES ('c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0'::uuid, 'validateur'::user_role)
ON CONFLICT (user_id, role) DO NOTHING;