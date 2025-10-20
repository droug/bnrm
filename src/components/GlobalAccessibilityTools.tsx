import { useState } from 'react';
import { Accessibility, MessageCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ChatBot from './ChatBot';

/**
 * Composant global - Boutons d'accessibilité et chatbot
 */
export function GlobalAccessibilityTools() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  const applyFontSize = (value: number) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value}%`;
  };

  return (
    <>
      {/* Bouton Accessibilité */}
      <button
        onClick={() => setShowAccessibility(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        aria-label="Accessibilité"
        title="Accessibilité"
      >
        <Accessibility size={24} />
      </button>

      {/* Bouton Chatbot */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        aria-label="Assistant virtuel"
        title="Assistant virtuel"
      >
        <MessageCircle size={24} />
      </button>

      {/* Dialog Accessibilité */}
      {showAccessibility && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          onClick={() => setShowAccessibility(false)}
        >
          <div
            style={{
              backgroundColor: 'hsl(var(--background))',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Accessibility size={20} />
              Accessibilité
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>
              Personnalisez l'affichage selon vos besoins
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Taille du texte: {fontSize}%
              </label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => applyFontSize(value[0])}
                min={80}
                max={150}
                step={10}
                className="w-full"
              />
            </div>

            <button
              onClick={() => setShowAccessibility(false)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Chatbot */}
      {showChatbot && (
        <div 
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '384px',
            maxWidth: 'calc(100vw - 48px)',
            zIndex: 99999
          }}
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
