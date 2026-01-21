-- Corriger la politique INSERT sur legal_deposit_parties
-- Le problème: la politique cherche initiator_id = auth.uid() mais initiator_id 
-- contient maintenant un ID de professional_registry, pas l'UID utilisateur

DROP POLICY IF EXISTS "Initiators can add parties to their requests" ON public.legal_deposit_parties;

-- Nouvelle politique qui utilise la même logique que is_legal_deposit_initiator
CREATE POLICY "Initiators can add parties to their requests"
ON public.legal_deposit_parties
FOR INSERT
WITH CHECK (
  is_admin_or_librarian(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.legal_deposit_requests ldr
    WHERE ldr.id = legal_deposit_parties.request_id
    AND public.is_legal_deposit_initiator(ldr.initiator_id)
  )
);