import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

export const useChatBot = (language: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string, userId?: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: language
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: {
          message: content.trim(),
          language: language,
          userId: userId || 'anonymous'
        }
      });

      if (error) throw error;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'bot',
        timestamp: new Date(),
        language: data.language || language
      };

      setMessages(prev => [...prev, botMessage]);
      return botMessage;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  const processVoiceToText = useCallback(async (audioBlob: Blob) => {
    try {
      setIsLoading(true);

      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: base64Audio,
          language: language
        }
      });

      if (error) throw error;
      return data.text;

    } catch (error) {
      console.error('Error processing voice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'audio.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [language, toast]);

  const playTextAsAudio = useCallback(async (text: string, voice: string = 'alloy') => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text,
          language: language,
          voice: voice
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        return new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            reject(new Error('Audio playback failed'));
          };

          audio.play().catch(reject);
        });
      }

    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Erreur",
        description: "Impossible de lire l'audio.",
        variant: "destructive",
      });
    }
  }, [language, toast]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const initializeWelcomeMessage = useCallback(() => {
    const welcomeMessages = {
      fr: "Bonjour ! Je suis l'assistant intelligent de la BNRM. Comment puis-je vous aider aujourd'hui ?",
      ar: "مرحباً! أنا المساعد الذكي للمكتبة الوطنية للمملكة المغربية. كيف يمكنني مساعدتك اليوم؟",
      en: "Hello! I am the BNRM intelligent assistant. How can I help you today?",
      ber: "Azul! Nekk d aɛessas aqehwan n temkarḍit taḥeggart n tgeldit n Lmerruk. Amek zemreɣ ad k-ɛiwneɣ ass-a?"
    };

    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        content: welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.fr,
        sender: 'bot',
        timestamp: new Date(),
        language: language
      };
      setMessages([welcomeMessage]);
    }
  }, [language, messages.length]);

  return {
    messages,
    isLoading,
    sendMessage,
    processVoiceToText,
    playTextAsAudio,
    clearMessages,
    initializeWelcomeMessage
  };
};