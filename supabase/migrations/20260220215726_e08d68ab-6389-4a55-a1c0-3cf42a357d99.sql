
-- Débannir l'utilisateur useryouness@gmail.com
UPDATE auth.users
SET 
  banned_until = NULL,
  updated_at = NOW()
WHERE email = 'useryouness@gmail.com';
