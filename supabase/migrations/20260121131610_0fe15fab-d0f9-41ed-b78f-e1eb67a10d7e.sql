-- Mettre à jour la politique RLS pour permettre aussi aux utilisateurs avec une demande approuvée de créer des demandes
DROP POLICY IF EXISTS "Professionals can create requests" ON public.legal_deposit_requests;

CREATE POLICY "Professionals can create requests"
  ON public.legal_deposit_requests
  FOR INSERT
  WITH CHECK (
    -- Vérifier via le registre professionnel
    EXISTS (
      SELECT 1
      FROM professional_registry pr
      WHERE pr.id = legal_deposit_requests.initiator_id
        AND pr.user_id = auth.uid()
    )
    OR
    -- Vérifier via les demandes d'inscription approuvées
    EXISTS (
      SELECT 1
      FROM professional_registration_requests prr
      WHERE prr.id = legal_deposit_requests.initiator_id
        AND prr.user_id = auth.uid()
        AND prr.status = 'approved'
    )
  );