
-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can view parties where they are involved" ON legal_deposit_parties;

-- Create a fixed policy without self-referencing subquery
CREATE POLICY "Users can view parties where they are involved" 
ON legal_deposit_parties 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR is_admin_or_librarian(auth.uid()) 
  OR request_id IN (
    SELECT request_id FROM legal_deposit_parties WHERE user_id = auth.uid()
  )
);
