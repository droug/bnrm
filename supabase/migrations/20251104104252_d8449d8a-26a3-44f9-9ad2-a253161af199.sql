-- Supprimer la politique actuelle
DROP POLICY IF EXISTS "Users can view participants" ON public.conversation_participants;

-- Créer une fonction security definer pour vérifier si un utilisateur est dans une conversation
CREATE OR REPLACE FUNCTION public.user_is_in_conversation(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE user_id = _user_id
    AND conversation_id = _conversation_id
  );
$$;

-- Créer une nouvelle politique utilisant la fonction
CREATE POLICY "Users can view participants" ON public.conversation_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    public.user_is_in_conversation(auth.uid(), conversation_id)
  );