-- Supprimer la politique problématique qui cause une récursion infinie
DROP POLICY IF EXISTS "Users can view participants" ON public.conversation_participants;

-- Créer une nouvelle politique simplifiée sans récursion
-- Les utilisateurs peuvent voir tous les participants des conversations dont ils font partie
CREATE POLICY "Users can view participants" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (
        c.created_by = auth.uid() OR
        conversation_id IN (
          SELECT cp.conversation_id 
          FROM public.conversation_participants cp
          WHERE cp.user_id = auth.uid()
        )
      )
    )
  );

-- Ajouter une politique pour permettre la mise à jour du last_read_at
CREATE POLICY "Users can update own participant record" ON public.conversation_participants
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());