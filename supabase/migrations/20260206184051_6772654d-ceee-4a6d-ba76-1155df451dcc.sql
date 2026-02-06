-- Créer le profil manquant pour soufianeeljarid0@gmail.com
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  institution,
  is_approved,
  created_at,
  updated_at
)
SELECT
  'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0',
  'Validateur DL',
  '',
  '',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = 'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0'
);