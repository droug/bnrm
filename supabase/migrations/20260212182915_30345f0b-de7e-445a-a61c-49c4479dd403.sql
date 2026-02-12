-- Update is_legal_deposit_initiator to also match when initiator_id equals user's auth.uid() directly
-- This handles drafts saved by users who are not yet in professional_registry

CREATE OR REPLACE FUNCTION public.is_legal_deposit_initiator(p_initiator_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct match: initiator_id = auth.uid() (for admin-created or fallback drafts)
  IF p_initiator_id = auth.uid() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.professional_registry 
    WHERE id = p_initiator_id AND user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.professional_registration_requests 
    WHERE id = p_initiator_id AND user_id = auth.uid() AND status = 'approved'
  );
END;
$$;

-- Also update the two-argument version
CREATE OR REPLACE FUNCTION public.is_legal_deposit_initiator(p_initiator_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Direct match: initiator_id = user_id (for admin-created or fallback drafts)
    p_initiator_id = p_user_id
    OR
    EXISTS (
      SELECT 1
      FROM public.professional_registry pr
      WHERE pr.id = p_initiator_id
        AND pr.user_id = p_user_id
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.professional_registration_requests prr
      WHERE prr.id = p_initiator_id
        AND prr.user_id = p_user_id
        AND prr.status = 'approved'
    );
$$;