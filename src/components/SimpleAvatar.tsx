import React, { useState, useEffect } from 'react';

interface SimpleAvatarProps {
  isActive: boolean;
  currentText?: string;
  language: string;
}

const SimpleAvatar: React.FC<SimpleAvatarProps> = ({ 
  isActive, 
  currentText = '', 
  language 
}) => {
  const [currentGesture, setCurrentGesture] = useState<string>('idle');
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (!isActive || !currentText) {
      setCurrentGesture('idle');
      return;
    }

    // Détection de gestes basée sur le contenu du texte
    const text = currentText.toLowerCase();
    
    if (text.includes('bonjour') || text.includes('salut') || text.includes('hello') || text.includes('مرحبا')) {
      setCurrentGesture('greeting');
      setAnimationClass('animate-bounce');
    } else if (text.includes('réfléchi') || text.includes('pense') || text.includes('think')) {
      setCurrentGesture('thinking');
      setAnimationClass('animate-pulse');
    } else if (text.length > 50) {
      setCurrentGesture('explaining');
      setAnimationClass('animate-wiggle');
    } else {
      setCurrentGesture('idle');
      setAnimationClass('animate-pulse');
    }

    // Reset animation after 2 seconds
    const timer = setTimeout(() => {
      setAnimationClass('');
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentText, isActive]);

  const getGestureEmoji = () => {
    switch (currentGesture) {
      case 'greeting': return '👋';
      case 'thinking': return '🤔';
      case 'explaining': return '💬';
      default: return '😊';
    }
  };

  const getGestureText = () => {
    switch (currentGesture) {
      case 'greeting': return 'Salutation';
      case 'thinking': return 'Réflexion';
      case 'explaining': return 'Explication';
      default: return 'Repos';
    }
  };

  return (
    <div className="w-full h-80 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-xl overflow-hidden relative shadow-2xl border border-primary/20 flex items-center justify-center">
      {/* Avatar simple avec emoji animé */}
      <div className="text-center">
        <div className={`text-8xl mb-4 ${animationClass} transition-all duration-300`}>
          🤖
        </div>
        
        {/* Geste actuel */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl">{getGestureEmoji()}</span>
          <div className="text-white font-semibold">
            {language === 'ar' ? 'لغة الإشارة' : 
             language === 'fr' ? 'Langue des signes' : 
             language === 'en' ? 'Sign Language' : 
             'Langue des signes'}
          </div>
        </div>

        {/* Indicateur de statut */}
        {isActive && (
          <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="text-sm text-white font-semibold">IA Active</span>
          </div>
        )}
      </div>

      {/* Légende des gestes */}
      {isActive && (
        <div className="absolute bottom-3 left-3 text-xs text-white bg-black/30 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span className="font-medium">{getGestureText()}</span>
          </div>
        </div>
      )}

      {/* Particules CSS */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-blue-400/60 rounded-full animate-ping`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleAvatar;