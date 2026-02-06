-- Créer le profil manquant pour le validateur soufianeeljarid0@gmail.com
INSERT INTO public.profiles (user_id, first_name, last_name, is_approved)
VALUES (
  'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0',
  'Soufiane',
  'ELJARID',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  is_approved = true,
  updated_at = NOW();