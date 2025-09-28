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
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-[9999] ${
          isOpen 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        style={{ 
          boxShadow: '0 8px 25px rgba(0,0,0,0.25), 0 0 20px rgba(var(--primary), 0.3)',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </Button>

      {/* Pulse Animation when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary/20 animate-ping z-[9998]"></div>
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