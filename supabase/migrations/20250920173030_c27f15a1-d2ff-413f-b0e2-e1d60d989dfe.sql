-- Change user role from visitor to admin for useryouness@gmail.com
UPDATE profiles 
SET role = 'admin', is_approved = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'useryouness@gmail.com'
);