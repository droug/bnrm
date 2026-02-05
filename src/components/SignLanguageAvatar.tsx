import React, { useEffect, useState } from 'react';
import { User, MessageSquare, Brain, Sparkles } from 'lucide-react';
import avatarImage from '@/assets/chatbot-avatar.jpg';

interface SignLanguageAvatarProps {
  isActive: boolean;
  currentText: string;
  language: string;
}

const SignLanguageAvatar: React.FC<SignLanguageAvatarProps> = ({ 
  isActive, 
  currentText,
  language
}) => {
  const [gesture, setGesture] = useState<'idle' | 'greeting' | 'thinking' | 'explaining'>('idle');
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (!currentText) {
      setGesture('idle');
      return;
    }

    const text = currentText.toLowerCase();
    
    if (text.includes('bonjour') || text.includes('hello') || text.includes('مرحبا') || 
        text.includes('salut') || text.includes('hi')) {
      setGesture('greeting');
    } else if (text.includes('?') || text.includes('comment') || text.includes('how') || 
               text.includes('كيف') || text.includes('pourquoi') || text.includes('why')) {
      setGesture('thinking');
    } else if (text.length > 50) {
      setGesture('explaining');
    } else {
      setGesture('idle');
    }

    // Trigger animation on text change
    setAnimationKey(prev => prev + 1);
  }, [currentText]);

  const getTitle = () => {
    switch (language) {
      case 'ar':
        return 'مساعد لغة الإشارة';
      case 'amz':
        return 'Tutlayt n yifassen';
      case 'es':
        return 'Asistente de Lengua de Signos';
      default:
        return 'Assistant Langue des Signes';
    }
  };

  const getGestureIcon = () => {
    switch (gesture) {
      case 'greeting':
        return <User className="w-8 h-8" />;
      case 'thinking':
        return <Brain className="w-8 h-8" />;
      case 'explaining':
        return <MessageSquare className="w-8 h-8" />;
      default:
        return <Sparkles className="w-8 h-8" />;
    }
  };

  const getGestureLabel = () => {
    switch (gesture) {
      case 'greeting':
        return language === 'ar' ? 'تحية' : 'Salutation';
      case 'thinking':
        return language === 'ar' ? 'تفكير' : 'Réflexion';
      case 'explaining':
        return language === 'ar' ? 'شرح' : 'Explication';
      default:
        return language === 'ar' ? 'جاهز' : 'Prêt';
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-lg overflow-hidden border-2 border-primary/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-3 border-b border-primary/30">
        <h3 className="text-sm font-semibold text-center flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {getTitle()}
        </h3>
      </div>

      {/* Avatar Container */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
        {/* Animated Avatar with Image */}
        <div className="relative mb-4">
          {/* Outer ring animation */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-20 ${
            isActive ? 'animate-ping' : ''
          }`} style={{ width: '140px', height: '140px', left: '-10px', top: '-10px' }} />
          
          {/* Main avatar circle with photo */}
          <div 
            key={animationKey}
            className={`relative w-28 h-28 rounded-full overflow-hidden shadow-2xl border-4 border-primary/30 ${
              isActive ? 'animate-pulse' : ''
            }`}
            style={{
              animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }}
          >
            {/* Avatar Image */}
            <img 
              src={avatarImage} 
              alt="Chatbot Avatar" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient for speech effect */}
            {isActive && (
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent animate-pulse" />
            )}

            {/* Gesture icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 backdrop-blur-[1px]">
              <div className="transform transition-all duration-500 text-white drop-shadow-lg">
                {getGestureIcon()}
              </div>
            </div>

            {/* Speaking indicator */}
            {isActive && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          {/* Particle effects */}
          {isActive && (
            <>
              <div className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
            </>
          )}
        </div>

        {/* Gesture label */}
        <div className="mb-3">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20">
            {getGestureLabel()}
          </span>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span>
            {isActive ? (language === 'ar' ? 'يتحدث...' : 'En cours...') : (language === 'ar' ? 'في انتظار' : 'En attente')}
          </span>
        </div>

        {/* Current text display */}
        {currentText && (
          <div className="mt-4 p-3 bg-background/50 rounded-lg border border-primary/20 max-w-full">
            <p className="text-xs text-center line-clamp-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {currentText}
            </p>
          </div>
        )}
      </div>

      {/* Decorative bottom wave */}
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
    </div>
  );
};

export default SignLanguageAvatar;
