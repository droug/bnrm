-- Remove the strict foreign key constraint on initiator_id
-- The RLS functions (is_legal_deposit_initiator) already validate access from both tables
ALTER TABLE public.legal_deposit_requests 
DROP CONSTRAINT IF EXISTS legal_deposit_requests_initiator_id_fkey;

-- Add a comment explaining the validation approach
COMMENT ON COLUMN public.legal_deposit_requests.initiator_id IS 'ID from either professional_registry or professional_registration_requests (approved). Validated by RLS function is_legal_deposit_initiator.';