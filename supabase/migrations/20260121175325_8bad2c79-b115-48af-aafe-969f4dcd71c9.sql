-- Step 1: Create the helper functions FIRST

-- Function to check if user is the initiator of a legal deposit
CREATE OR REPLACE FUNCTION public.is_legal_deposit_initiator(p_initiator_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Function to check if user can access a legal deposit request
CREATE OR REPLACE FUNCTION public.can_access_legal_deposit_request(p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_initiator_id uuid;
BEGIN
  SELECT initiator_id INTO v_initiator_id
  FROM public.legal_deposit_requests
  WHERE id = p_request_id;
  
  IF v_initiator_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF public.is_legal_deposit_initiator(v_initiator_id) THEN
    RETURN TRUE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.legal_deposit_parties ldp
    JOIN public.professional_registry pr ON pr.id = ldp.professional_id
    WHERE ldp.request_id = p_request_id AND pr.user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;