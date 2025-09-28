import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import SimpleAvatar from '@/components/SimpleAvatar';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  X, 
  Settings, 
  Loader2,
  Bot,
  User,
  HandHeart,
  Eye,
  EyeOff
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

interface ChatBotProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose, isOpen = true }) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [signLanguageEnabled, setSignLanguageEnabled] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
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

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      language: language
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to chatbot:', content.trim());
      const { data, error } = await supabase.functions.invoke('chatbot-ai', {
        body: {
          message: content.trim(),
          language: language,
          userId: 'user' // Can be replaced with actual user ID
        }
      });

      console.log('Chatbot response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'bot',
        timestamp: new Date(),
        language: data.language || language
      };

      setMessages(prev => [...prev, botMessage]);

  // Mettre à jour le message actuel pour l'avatar
  setCurrentBotMessage(data.reply);

      // Text-to-speech if audio is enabled
      if (audioEnabled && data.reply) {
        await playTextAsAudio(data.reply);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Enregistrement en cours",
        description: "Parlez maintenant...",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioToText = async (audioBlob: Blob) => {
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

      if (data.text) {
        await sendMessage(data.text);
      } else {
        toast({
          title: "Aucun texte détecté",
          description: "Veuillez parler plus clairement et réessayer.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'audio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playTextAsAudio = async (text: string) => {
    try {
      setIsSpeaking(true);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text,
          language: language,
          voice: 'alloy'
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
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      }

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fonctions de drag and drop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limiter la position dans la fenêtre
    const maxX = window.innerWidth - 400; // largeur de la fenêtre
    const maxY = window.innerHeight - 750; // hauteur de la fenêtre
    
    setPosition({
      x: Math.max(-350, Math.min(newX, maxX)), // Permet de bouger vers la gauche
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  return (
    <div
      ref={chatWindowRef}
      className="fixed shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-lg transition-all duration-300 transform-gpu rounded-lg overflow-hidden"
      style={{
        right: `${16 + position.x}px`,
        top: `${64 + position.y}px`,
        width: window.innerWidth < 640 ? 'calc(100vw - 2rem)' : '384px',
        height: '750px',
        maxHeight: 'calc(100vh - 5rem)',
        zIndex: 99999,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div className="p-0 h-full flex flex-col overflow-hidden relative">
        {/* Barre de déplacement */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary/30 rounded-full mt-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        ></div>
        
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Assistant BNRM</h3>
              <Badge variant="secondary" className="text-xs">
                {isSpeaking ? 'En train de parler...' : 
                 isRecording ? 'Écoute...' : 
                 signLanguageEnabled ? 'Langue des signes' : 'En ligne'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSignLanguageEnabled(!signLanguageEnabled)}
              className={`w-8 h-8 p-0 ${signLanguageEnabled ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Activer/Désactiver la langue des signes"
            >
              {signLanguageEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="w-8 h-8 p-0"
              title="Activer/Désactiver l'audio"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {/* Bouton fermer */}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600"
                title="Fermer l'assistant"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Avatar pour la langue des signes - TOUJOURS VISIBLE */}
        {signLanguageEnabled && (
          <div className="border-b bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-4">
            <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-xl overflow-hidden relative shadow-lg border border-primary/20 flex items-center justify-center">
              {/* Avatar visible */}
              <div className="text-center">
                <div className="text-5xl mb-3 animate-bounce">🤖</div>
                <div className="text-lg font-semibold text-blue-600 mb-2">Assistant IA BNRM</div>
                <div className="flex items-center justify-center gap-2 bg-blue-600/20 backdrop-blur-md rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-800 font-semibold">Langue des signes active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-muted/30">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Form submitted with message:', inputMessage);
              if (inputMessage.trim()) {
                sendMessage(inputMessage);
              }
              return false;
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('Tapez votre message...')}
                disabled={isLoading || isRecording}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Enter pressed with message:', inputMessage);
                    if (inputMessage.trim()) {
                      sendMessage(inputMessage);
                    }
                    return false;
                  }
                }}
                onKeyPress={(e) => {
                  // Empêcher tous les événements keypress sur Enter
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                className="rounded-full"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`rounded-full w-10 h-10 p-0 ${
                isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {isSpeaking && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopAudio}
                className="rounded-full w-10 h-10 p-0"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || isRecording}
              size="sm"
              className="rounded-full w-10 h-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;