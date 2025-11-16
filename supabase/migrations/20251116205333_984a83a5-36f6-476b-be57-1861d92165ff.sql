
-- Ajouter le rôle admin pour l'utilisateur Younes EL FADDI
INSERT INTO public.user_roles (user_id, role, granted_by)
SELECT 
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4',
  'admin',
  '5631cc25-129d-4635-bbf3-a9eb8443f6a4'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '5631cc25-129d-4635-bbf3-a9eb8443f6a4' 
  AND role = 'admin'
);
