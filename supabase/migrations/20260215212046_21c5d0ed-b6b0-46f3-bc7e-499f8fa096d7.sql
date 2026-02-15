-- Fix the currently banned user: unban and reset profile
-- Note: The auth.users ban must be removed via the edge function re-approval
-- Fix the profile status
UPDATE public.profiles 
SET account_status = 'active', updated_at = now() 
WHERE user_id = 'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0' AND account_status = 'deleted';

-- Reset the registration request status back to pending so it can be re-approved
UPDATE public.professional_registration_requests 
SET status = 'pending', updated_at = now() 
WHERE user_id = 'c6bcad7c-6fcd-4303-8a8d-2123ccbc84a0' AND status = 'deleted';