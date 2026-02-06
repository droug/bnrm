-- Permettre aux validateurs (rôle 'validateur') d'accéder aux demandes en arbitrage

-- 1) Helper: vérifier si un user est validateur
CREATE OR REPLACE FUNCTION public.is_validator(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = user_uuid
      AND ur.role = 'validateur'
      AND p.is_approved = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
$$;

-- 2) Les validateurs peuvent voir toutes les demandes marquées "arbitration_requested"
DROP POLICY IF EXISTS "Validators can view arbitration requests" ON public.legal_deposit_requests;
CREATE POLICY "Validators can view arbitration requests"
ON public.legal_deposit_requests
FOR SELECT
USING (
  public.is_validator(auth.uid())
  AND arbitration_requested IS TRUE
);

-- 3) Les validateurs peuvent statuer (approve/reject) sur les demandes en attente d'arbitrage
DROP POLICY IF EXISTS "Validators can arbitrate requests" ON public.legal_deposit_requests;
CREATE POLICY "Validators can arbitrate requests"
ON public.legal_deposit_requests
FOR UPDATE
USING (
  public.is_validator(auth.uid())
  AND arbitration_requested IS TRUE
  AND arbitration_status = 'pending'
)
WITH CHECK (
  public.is_validator(auth.uid())
  AND arbitration_requested IS TRUE
  AND arbitration_validated_by = auth.uid()
  AND arbitration_validated_at IS NOT NULL
  AND arbitration_status IN ('approved', 'rejected')
);
