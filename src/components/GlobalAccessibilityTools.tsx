import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { AccessibilityToolkit } from './AccessibilityToolkit';
import SmartChatBot from './SmartChatBot';

/**
 * Composant global - Réutilise les outils du portail principal
 * (AccessibilityToolkit et SmartChatBot)
 */
export function GlobalAccessibilityTools() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  return (
    <>
      {/* Boutons flottants fixes en bas à droite */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 9999
        }}
        role="toolbar"
        aria-label="Outils d'assistance"
      >
        {/* Bouton Accessibilité - Utilise le composant du portail */}
        <div style={{ 
          backgroundColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <AccessibilityToolkit />
        </div>

        {/* Bouton Chatbot - Utilise le composant du portail */}
        <Button
          variant="default"
          size="lg"
          onClick={() => setIsChatBotOpen(!isChatBotOpen)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all relative"
          style={{ padding: 0 }}
          title="Assistant IA"
          aria-label={isChatBotOpen ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
        >
          <Bot className="h-6 w-6" />
          {!isChatBotOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid hsl(var(--background))'
              }}
              aria-hidden="true"
            />
          )}
        </Button>
      </div>

      {/* Chatbot intelligent - Composant du portail */}
      {isChatBotOpen && (
        <SmartChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
      )}
    </>
  );
}
