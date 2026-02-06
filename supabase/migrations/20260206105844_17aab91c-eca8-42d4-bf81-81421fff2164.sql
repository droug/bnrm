-- Supprimer le rôle validateur de useryouness@gmail.com (garder uniquement admin)
DELETE FROM public.user_roles 
WHERE user_id = '5631cc25-129d-4635-bbf3-a9eb8443f6a4'
  AND role = 'validateur';

-- Supprimer également de user_system_roles si présent
DELETE FROM public.user_system_roles 
WHERE user_id = '5631cc25-129d-4635-bbf3-a9eb8443f6a4'
  AND role_id IN (SELECT id FROM public.system_roles WHERE role_code = 'validateur');