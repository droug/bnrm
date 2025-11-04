-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Creators can add participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can add themselves as participants" ON public.conversation_participants;

-- Créer une nouvelle politique qui permet au créateur d'ajouter n'importe quel participant
CREATE POLICY "Users can add participants to conversations they created" 
ON public.conversation_participants
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id
    AND (created_by = auth.uid() OR created_by IS NULL)
  )
);