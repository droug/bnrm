import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, MessageCircle } from 'lucide-react';
import { AccessibilityToolkit } from './AccessibilityToolkit';
import ChatBot from './ChatBot';

/**
 * Composant global qui fournit les outils d'accessibilité et le chatbot
 * sur toutes les interfaces du système (BNRM, Kitab, CBM, Bibliothèque numérique, etc.)
 */
export function GlobalAccessibilityTools() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <>
      {/* Boutons flottants fixes en bas à droite */}
      <div 
        className="fixed bottom-6 right-6 flex flex-col gap-3"
        style={{ zIndex: 9000 }}
        role="toolbar"
        aria-label="Outils d'assistance"
      >
        {/* Bouton Accessibilité */}
        <Button
          size="lg"
          onClick={() => setShowAccessibility(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-primary text-primary-foreground"
          aria-label="Ouvrir les outils d'accessibilité"
          title="Accessibilité"
        >
          <Accessibility className="h-6 w-6" aria-hidden="true" />
        </Button>

        {/* Bouton Chatbot */}
        <Button
          size="lg"
          variant="default"
          onClick={() => setShowChatbot(!showChatbot)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={showChatbot ? "Fermer l'assistant virtuel" : "Ouvrir l'assistant virtuel"}
          title="Assistant virtuel"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>

      {/* Dialog d'accessibilité - Utilise AccessibilityToolkit comme modal */}
      {showAccessibility && (
        <div style={{ zIndex: 9999 }}>
          <AccessibilityToolkit />
          {/* Overlay pour fermer */}
          <div 
            className="fixed inset-0 bg-black/50 cursor-pointer"
            style={{ zIndex: 9998 }}
            onClick={() => setShowAccessibility(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Chatbot */}
      {showChatbot && (
        <div 
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)]"
          style={{ zIndex: 9100 }}
          role="complementary"
          aria-label="Assistant virtuel"
        >
          <ChatBot
            isOpen={showChatbot}
            onClose={() => setShowChatbot(false)}
          />
        </div>
      )}
    </>
  );
}
