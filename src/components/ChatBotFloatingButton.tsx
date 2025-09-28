import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import ChatBot from './ChatBot';

const ChatBotFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 ${
          isOpen 
            ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        style={{ 
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Pulse Animation when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary/30 animate-ping z-30"></div>
      )}

      {/* ChatBot Component */}
      <ChatBot 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default ChatBotFloatingButton;