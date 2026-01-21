-- Create the UPDATE policy using the existing is_admin_or_librarian function
CREATE POLICY "Users can update accessible pending requests"
ON public.legal_deposit_requests
FOR UPDATE
USING (
  (public.is_legal_deposit_initiator(initiator_id) AND status IN ('brouillon', 'soumis', 'en_attente_validation_b'))
  OR public.is_admin_or_librarian(auth.uid())
);