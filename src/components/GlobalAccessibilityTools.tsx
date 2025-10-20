import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, Bot, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import SmartChatBot from './SmartChatBot';

/**
 * Composant global autonome - Boutons flottants visibles partout
 */
export function GlobalAccessibilityTools() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);

  const applyFontSize = (value: number) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value}%`;
  };

  const resetSettings = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
  };

  return (
    <>
      {/* Boutons flottants - Toujours visibles */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Bouton Accessibilité */}
        <button
          onClick={() => setShowAccessibility(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          title="Accessibilité"
          aria-label="Ouvrir les outils d'accessibilité"
        >
          <Accessibility size={24} strokeWidth={2} />
        </button>

        {/* Bouton Chatbot */}
        <button
          onClick={() => setIsChatBotOpen(!isChatBotOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
          }}
          title="Assistant IA"
          aria-label={isChatBotOpen ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
        >
          <Bot size={24} strokeWidth={2} />
          {!isChatBotOpen && (
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid hsl(var(--background))'
              }}
            />
          )}
        </button>
      </div>

      {/* Modal Accessibilité */}
      {showAccessibility && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setShowAccessibility(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000000,
              backdropFilter: 'blur(2px)'
            }}
          />
          
          {/* Dialog */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'hsl(var(--background))',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              zIndex: 1000001
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Accessibility size={20} />
                Accessibilité
              </h2>
              <button
                onClick={() => setShowAccessibility(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
            
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>
              Personnalisez l'affichage selon vos besoins
            </p>

            {/* Taille du texte */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
                Taille du texte : {fontSize}%
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

            {/* Boutons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={resetSettings}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: 'hsl(var(--primary))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setShowAccessibility(false)}
                style={{
                  flex: 1,
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
        </>
      )}

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
