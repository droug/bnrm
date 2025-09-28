-- Create chat_conversations table
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  language TEXT NOT NULL DEFAULT 'fr',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot_knowledge_base table for training data
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr',
  keywords TEXT[],
  source_type TEXT,
  source_url TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatbot_interactions table for analytics
CREATE TABLE IF NOT EXISTS public.chatbot_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  interaction_type TEXT NOT NULL, -- 'message', 'voice', 'image_search'
  query_text TEXT,
  response_text TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  response_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Users can view their own conversations" ON public.chat_conversations
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can create their own conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own conversations" ON public.chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all conversations" ON public.chat_conversations
  FOR SELECT USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their conversations" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_conversations 
      WHERE id = conversation_id 
      AND (user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for chatbot_knowledge_base
CREATE POLICY "Everyone can view active knowledge base" ON public.chatbot_knowledge_base
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage knowledge base" ON public.chatbot_knowledge_base
  FOR ALL USING (is_admin_or_librarian(auth.uid()));

-- RLS Policies for chatbot_interactions
CREATE POLICY "Users can view their own interactions" ON public.chatbot_interactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can create their own interactions" ON public.chatbot_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Admins can view all interactions" ON public.chatbot_interactions
  FOR SELECT USING (is_admin_or_librarian(auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON public.chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_language ON public.chat_conversations(language);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_category ON public.chatbot_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_language ON public.chatbot_knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_base_keywords ON public.chatbot_knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_user_id ON public.chatbot_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_created_at ON public.chatbot_interactions(created_at);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_conversations_updated_at 
  BEFORE UPDATE ON public.chat_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_knowledge_base_updated_at 
  BEFORE UPDATE ON public.chatbot_knowledge_base 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial knowledge base data for BNRM
INSERT INTO public.chatbot_knowledge_base (title, content, category, language, keywords, priority) VALUES
  ('Informations générales BNRM', 'La Bibliothèque Nationale du Royaume du Maroc (BNRM) est l''institution de référence pour la conservation et la valorisation du patrimoine documentaire marocain. Créée pour préserver l''héritage culturel du Maroc.', 'general', 'fr', ARRAY['BNRM', 'bibliothèque', 'nationale', 'Maroc', 'patrimoine'], 10),
  ('Horaires d''ouverture', 'La BNRM est ouverte du lundi au vendredi de 9h à 17h, et le samedi de 9h à 13h. Fermée le dimanche et les jours fériés.', 'horaires', 'fr', ARRAY['horaires', 'ouverture', 'heures'], 9),
  ('Adresse et accès', 'La BNRM est située Avenue Ibn Battouta, Rabat, Maroc. Accessible en transport public et dispose d''un parking.', 'acces', 'fr', ARRAY['adresse', 'localisation', 'Rabat', 'accès'], 9),
  ('Services disponibles', 'La BNRM propose des services de consultation, reproduction de documents, recherche bibliographique, dépôt légal, et formation documentaire.', 'services', 'fr', ARRAY['services', 'consultation', 'reproduction', 'recherche'], 8),
  ('Collections manuscrits', 'La BNRM conserve une riche collection de manuscrits arabes, amazighs et en langues étrangères, témoins de l''histoire intellectuelle du Maroc.', 'collections', 'fr', ARRAY['manuscrits', 'arabes', 'amazighs', 'collections'], 8),
  ('Dépôt légal', 'Le dépôt légal est obligatoire pour toutes les publications produites au Maroc. La BNRM collecte, conserve et met à disposition les documents déposés.', 'depot_legal', 'fr', ARRAY['dépôt', 'légal', 'publications', 'obligatoire'], 8);

-- Insert Arabic knowledge base
INSERT INTO public.chatbot_knowledge_base (title, content, category, language, keywords, priority) VALUES
  ('معلومات عامة عن المكتبة الوطنية', 'المكتبة الوطنية للمملكة المغربية هي المؤسسة المرجعية لحفظ وتثمين التراث الوثائقي المغربي. تم إنشاؤها للحفاظ على التراث الثقافي للمغرب.', 'general', 'ar', ARRAY['المكتبة', 'الوطنية', 'المغرب', 'التراث'], 10),
  ('أوقات العمل', 'المكتبة الوطنية مفتوحة من الاثنين إلى الجمعة من 9 صباحاً إلى 5 مساءً، والسبت من 9 صباحاً إلى 1 ظهراً. مغلقة يوم الأحد والعطل الرسمية.', 'horaires', 'ar', ARRAY['أوقات', 'العمل', 'ساعات'], 9),
  ('العنوان والوصول', 'تقع المكتبة الوطنية في شارع ابن بطوطة، الرباط، المغرب. يمكن الوصول إليها بوسائل النقل العام وتتوفر على موقف للسيارات.', 'acces', 'ar', ARRAY['عنوان', 'موقع', 'الرباط', 'وصول'], 9);

-- Create function to search knowledge base
CREATE OR REPLACE FUNCTION search_knowledge_base(
  search_query TEXT,
  search_language TEXT DEFAULT 'fr',
  limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  relevance REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    (
      ts_rank(
        to_tsvector('french', kb.title || ' ' || kb.content || ' ' || array_to_string(kb.keywords, ' ')),
        plainto_tsquery('french', search_query)
      ) * kb.priority
    )::REAL as relevance
  FROM public.chatbot_knowledge_base kb
  WHERE 
    kb.is_active = true 
    AND kb.language = search_language
    AND (
      to_tsvector('french', kb.title || ' ' || kb.content || ' ' || array_to_string(kb.keywords, ' ')) 
      @@ plainto_tsquery('french', search_query)
    )
  ORDER BY relevance DESC
  LIMIT limit_results;
END;
$$;