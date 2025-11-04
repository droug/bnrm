-- Ajouter une valeur par défaut pour created_by
ALTER TABLE public.conversations 
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Permettre aux utilisateurs de créer leurs propres entrées de participants
CREATE POLICY "Users can add themselves as participants" ON public.conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());