import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import SignLanguageAvatar from '@/components/SignLanguageAvatar';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Loader2,
  Bot,
  User,
  BookOpen,
  UserCircle,
  Building2,
  Download,
  Settings,
  MessageCircle,
  Accessibility
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

interface SmartChatBotProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const SmartChatBot: React.FC<SmartChatBotProps> = ({ onClose, isOpen = true }) => {
  const { t, language } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [requestType, setRequestType] = useState<string>('general');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestTypes = {
    fr: {
      general: 'Question générale',
      works: 'Œuvres et résumés',
      authors: 'Auteurs et biographies',
      publishers: 'Éditeurs et historique',
      download: 'Télécharger des ouvrages',
      services: 'Services de la BNRM'
    },
    ar: {
      general: 'سؤال عام',
      works: 'الأعمال والملخصات',
      authors: 'المؤلفون والسير',
      publishers: 'الناشرون والتاريخ',
      download: 'تحميل الكتب',
      services: 'خدمات المكتبة'
    },
    en: {
      general: 'General question',
      works: 'Works and summaries',
      authors: 'Authors and biographies',
      publishers: 'Publishers and history',
      download: 'Download works',
      services: 'BNRM services'
    },
    ber: {
      general: 'Asqsi amatu',
      works: 'Tiktibin d yegzumen',
      authors: 'Imessas d tilisa',
      publishers: 'Inuffar d umezruy',
      download: 'Sider tiktibin',
      services: 'Tanafa n BNRM'
    }
  };

  // Scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessages = {
      fr: `Bonjour${user ? ` ${profile?.first_name || ''}` : ''} ! Je suis l'assistant intelligent de la BNRM. 

Je peux vous aider à:
📚 Rechercher des œuvres et obtenir des résumés
👤 Découvrir des auteurs et leurs biographies
🏢 Connaître l'historique des éditeurs
💾 Télécharger des ouvrages (selon vos permissions)
⚙️ Utiliser les services de la BNRM

Comment puis-je vous aider aujourd'hui ?`,
      ar: `مرحباً${user ? ` ${profile?.first_name || ''}` : ''}! أنا المساعد الذكي للمكتبة الوطنية.

يمكنني مساعدتك في:
📚 البحث عن الأعمال والحصول على الملخصات
👤 اكتشاف المؤلفين وسيرهم الذاتية
🏢 معرفة تاريخ الناشرين
💾 تحميل الكتب (حسب صلاحياتك)
⚙️ استخدام خدمات المكتبة الوطنية

كيف يمكنني مساعدتك اليوم؟`,
      en: `Hello${user ? ` ${profile?.first_name || ''}` : ''}! I am the BNRM intelligent assistant.

I can help you:
📚 Search for works and get summaries
👤 Discover authors and their biographies
🏢 Learn about publishers' history
💾 Download works (according to your permissions)
⚙️ Use BNRM services

How can I help you today?`,
      ber: `Azul${user ? ` ${profile?.first_name || ''}` : ''}! Nekk d aɛessas aqehwan n BNRM.

Zemreɣ ad k-ɛiwneɣ deg:
📚 Anadi ɣef tiktibin d yegzumen
👤 Tifrat n yimessas d tilisa-nsen
🏢 Amezruy n inuffar
💾 Asider n tiktibin (akken iseḥḥa)
⚙️ Tanafa n BNRM

Amek zemreɣ ad k-ɛiwneɣ ass-a?`
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
  }, [language, messages.length, user, profile]);

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
      console.log('Sending message to smart chatbot:', content.trim());
      const { data, error } = await supabase.functions.invoke('smart-chatbot', {
        body: {
          message: content.trim(),
          language: language,
          userId: user?.id || 'anonymous',
          requestType: requestType,
          conversationHistory: messages.slice(-10) // Derniers 10 messages pour le contexte
        }
      });

      console.log('Smart chatbot response:', { data, error });

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
      setCurrentBotMessage(data.reply);

      // Text-to-speech if audio is enabled
      if (audioEnabled && data.reply) {
        await playTextAsAudio(data.reply);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: language === 'ar' 
          ? "لا يمكن إرسال الرسالة. يرجى المحاولة مرة أخرى."
          : "Impossible d'envoyer le message. Veuillez réessayer.",
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
        title: language === 'ar' ? "جاري التسجيل" : "Enregistrement en cours",
        description: language === 'ar' ? "تحدث الآن..." : "Parlez maintenant...",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: language === 'ar' 
          ? "لا يمكن الوصول إلى الميكروفون."
          : "Impossible d'accéder au microphone.",
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
          title: language === 'ar' ? "لم يتم اكتشاف نص" : "Aucun texte détecté",
          description: language === 'ar' 
            ? "يرجى التحدث بوضوح أكثر والمحاولة مرة أخرى."
            : "Veuillez parler plus clairement et réessayer.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: language === 'ar' ? "خطأ" : "Erreur",
        description: language === 'ar' 
          ? "لا يمكن معالجة الصوت."
          : "Impossible de traiter l'audio.",
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

  // Drag and drop handlers
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
    
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 750;
    
    setPosition({
      x: Math.max(-350, Math.min(newX, maxX)),
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

  // Toujours visible - pas de condition isOpen

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'works': return <BookOpen className="w-4 h-4" />;
      case 'authors': return <UserCircle className="w-4 h-4" />;
      case 'publishers': return <Building2 className="w-4 h-4" />;
      case 'download': return <Download className="w-4 h-4" />;
      case 'services': return <Settings className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Bouton flottant quand le chatbot est réduit */}
      {!isOpen && (
        <Button
          onClick={() => onClose && onClose()}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-primary to-secondary hover:scale-110 transition-all duration-300 z-[99998] border-4 border-white/20"
          title="Ouvrir l'assistant intelligent"
        >
          <MessageCircle className="w-8 h-8 text-white" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
        </Button>
      )}

      {/* Fenêtre du chatbot */}
      <div
        className={`fixed shadow-2xl border-2 border-primary/30 bg-background/95 backdrop-blur-lg transition-all duration-300 transform-gpu rounded-lg overflow-hidden ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
        }`}
        style={{
          right: `${16 + position.x}px`,
          top: `${64 + position.y}px`,
          width: window.innerWidth < 640 ? 'calc(100vw - 2rem)' : '500px',
          height: showSignLanguage ? '950px' : '750px',
          maxHeight: 'calc(100vh - 5rem)',
          zIndex: 99999,
          cursor: isDragging ? 'grabbing' : 'default',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      >
      <div className="p-0 h-full flex flex-col overflow-hidden relative">
        {/* Drag handle */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary/30 rounded-full mt-2 cursor-grab active:cursor-grabbing z-10"
          onMouseDown={handleMouseDown}
        ></div>
        
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Assistant Intelligent BNRM</h3>
              <Badge variant="secondary" className="text-xs mt-1">
                {isSpeaking ? (language === 'ar' ? 'يتحدث...' : 'En train de parler...') : 
                 isRecording ? (language === 'ar' ? 'يستمع...' : 'Écoute...') : 
                 (language === 'ar' ? 'متصل' : 'En ligne')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignLanguage(!showSignLanguage)}
              className={`w-8 h-8 p-0 ${showSignLanguage ? 'bg-primary/20 text-primary' : ''}`}
              title={language === 'ar' ? "لغة الإشارة" : "Langue des signes"}
            >
              <Accessibility className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="w-8 h-8 p-0"
              title={language === 'ar' ? "تشغيل/إيقاف الصوت" : "Activer/Désactiver l'audio"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600"
                title={language === 'ar' ? "إغلاق المساعد" : "Fermer l'assistant"}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Avatar langue des signes */}
        {showSignLanguage && (
          <div className="p-3 border-b">
            <SignLanguageAvatar 
              isActive={isLoading || isSpeaking}
              currentText={currentBotMessage}
              language={language}
            />
          </div>
        )}

        {/* Request type selector */}
        <div className="p-3 border-b bg-muted/30">
          <Select value={requestType} onValueChange={setRequestType}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                {getRequestTypeIcon(requestType)}
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(requestTypes[language as keyof typeof requestTypes]).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {getRequestTypeIcon(key)}
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                  <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  <div className="text-xs opacity-70 mt-2">
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card border rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">
                      {language === 'ar' ? 'المساعد يفكر...' : 'L\'assistant réfléchit...'}
                    </span>
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
                placeholder={language === 'ar' ? "اكتب رسالتك..." : "Tapez votre message..."}
                disabled={isLoading || isRecording}
                className="w-full"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant={isRecording ? "destructive" : "secondary"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputMessage.trim() || isLoading || isRecording}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
      </div>
    </>
  );
};

export default SmartChatBot;
