import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { AccessibilityToolkit } from './AccessibilityToolkit';
import SmartChatBot from './SmartChatBot';

/**
 * Composant global - Boutons flottants d'accessibilité et chatbot
 */
export function GlobalAccessibilityTools() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  return (
    <>
      {/* Conteneur des boutons flottants */}
      <div 
        className="fixed bottom-6 right-6 flex flex-col gap-3"
        style={{ zIndex: 999999 }}
      >
        {/* Bouton Accessibilité */}
        <div className="bg-primary rounded-full p-2 shadow-lg hover:shadow-xl transition-all">
          <AccessibilityToolkit />
        </div>

        {/* Bouton Chatbot */}
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsChatBotOpen(!isChatBotOpen)}
          className="rounded-full h-14 w-14 p-0 shadow-lg hover:shadow-xl transition-all relative"
          title="Assistant IA"
        >
          <Bot className="h-6 w-6" />
          {!isChatBotOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </div>

      {/* Chatbot */}
      {isChatBotOpen && (
        <SmartChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
    </>
  );
}
