-- Supprimer l'ancienne politique de création
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Créer une nouvelle politique qui fonctionne avec le DEFAULT
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    created_by = auth.uid() OR 
    created_by IS NULL -- Permettre NULL car le DEFAULT s'appliquera après
  );