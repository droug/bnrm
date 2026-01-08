
-- Drop the still-problematic policy
DROP POLICY IF EXISTS "Users can view parties where they are involved" ON legal_deposit_parties;

-- Create a security definer function to get user's request IDs without recursion
CREATE OR REPLACE FUNCTION public.get_user_party_request_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT request_id FROM legal_deposit_parties WHERE user_id = p_user_id
$$;

-- Create a fixed policy using the security definer function
CREATE POLICY "Users can view parties where they are involved" 
ON legal_deposit_parties 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin_or_librarian(auth.uid()) 
  OR request_id IN (SELECT * FROM get_user_party_request_ids(auth.uid()))
);
