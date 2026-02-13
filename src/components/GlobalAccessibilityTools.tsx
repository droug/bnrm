import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, Bot, X, RotateCcw, MousePointer, Type, Eye, Play, Pause } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import SmartChatBot from './SmartChatBot';

interface AccessibilitySettings {
  cursorSize: number;
  contrast: 'normal' | 'light' | 'dark';
  fontSize: number;
  saturation: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  isReading: boolean;
}

const defaultSettings: AccessibilitySettings = {
  cursorSize: 1,
  contrast: 'normal',
  fontSize: 100,
  saturation: 100,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 0,
  isReading: false,
};

/**
 * Composant global autonome - Boutons flottants visibles partout
 */
export function GlobalAccessibilityTools() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);


  useEffect(() => {
    const root = document.documentElement;
    
    // Appliquer les styles CSS
    root.style.setProperty('--cursor-size', `${settings.cursorSize}`);
    root.style.setProperty('--font-size-multiplier', `${settings.fontSize / 100}`);
    root.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);
    root.style.setProperty('--word-spacing', `${settings.wordSpacing}px`);
    root.style.setProperty('--line-height-add', `${settings.lineHeight * 0.1}`);
    
    // Appliquer le contraste
    document.body.className = document.body.className.replace(/contrast-\w+/g, '');
    if (settings.contrast !== 'normal') {
      document.body.classList.add(`contrast-${settings.contrast}`);
    }

    // Appliquer la saturation (NE PAS appliquer de filter quand saturation=100 sinon cela casse les modales position:fixed)
    document.body.style.filter = settings.saturation === 100 ? '' : `saturate(${settings.saturation}%)`;
    
    // Curseur
    if (settings.cursorSize !== 1) {
      document.body.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${24 * settings.cursorSize}' height='${24 * settings.cursorSize}' viewBox='0 0 24 24' fill='%23000'%3E%3Cpath d='M7.33 24l4.67-4.67V24zm9.33 0v-4.67L21.33 24zM0 16.67V12l4.67 4.67zm24 0L19.33 12v4.67z'/%3E%3C/svg%3E") ${12 * settings.cursorSize} ${12 * settings.cursorSize}, auto`;
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const toggleReading = () => {
    if (!settings.isReading) {
      // Commencer la lecture
      const text = document.body.innerText;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
        updateSetting('isReading', true);
        utterance.onend = () => updateSetting('isReading', false);
      }
    } else {
      // Arrêter la lecture
      window.speechSynthesis.cancel();
      updateSetting('isReading', false);
    }
  };

  return (
    <>
      {/* Boutons flottants - Toujours visibles */}
      <div 
        className="fixed bottom-6 right-6 flex flex-col gap-3"
        style={{ zIndex: 999999 }}
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
                onClick={resetSettings}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'hsl(var(--muted-foreground))'
                }}
                aria-label="Réinitialiser"
              >
                <RotateCcw size={16} />
                <span style={{ fontSize: '14px' }}>Réinitialiser</span>
              </button>
            </div>
            
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>
              Ajustez les paramètres d'accessibilité pour améliorer votre expérience
            </p>

            {/* Grille des contrôles - 2 colonnes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Curseur */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <MousePointer size={24} style={{ marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Curseur</span>
                <Slider
                  value={[settings.cursorSize]}
                  onValueChange={([value]) => updateSetting('cursorSize', value)}
                  min={1}
                  max={3}
                  step={0.5}
                  className="w-full mt-2"
                />
              </div>

              {/* Espacement des mots */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px', color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}>H</div>
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Espacement des mots</span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{settings.wordSpacing}px</span>
                <Slider
                  value={[settings.wordSpacing]}
                  onValueChange={([value]) => updateSetting('wordSpacing', value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full mt-1"
                />
              </div>

              {/* Espacement des lettres */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px', color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}>A a</div>
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Espacement des lettres</span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{settings.letterSpacing}px</span>
                <Slider
                  value={[settings.letterSpacing]}
                  onValueChange={([value]) => updateSetting('letterSpacing', value)}
                  min={0}
                  max={5}
                  step={0.5}
                  className="w-full mt-1"
                />
              </div>

              {/* Espacement des lignes */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <div style={{ fontSize: '18px', marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }}>≡</div>
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Espacement des lignes</span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{settings.lineHeight}px</span>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting('lineHeight', value)}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full mt-1"
                />
              </div>

              {/* Taille de texte */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <Type size={24} style={{ marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>Taille de texte</span>
                <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{settings.fontSize}%</span>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={75}
                  max={150}
                  step={5}
                  className="w-full mt-1"
                />
              </div>

              {/* Contraste */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <Eye size={24} style={{ marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }} />
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center', marginBottom: '8px' }}>Contraste</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('contrast', 'normal')}
                    className="text-xs px-2 h-6"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={settings.contrast === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('contrast', 'light')}
                    className="text-xs px-2 h-6"
                  >
                    Léger
                  </Button>
                  <Button
                    variant={settings.contrast === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('contrast', 'dark')}
                    className="text-xs px-2 h-6"
                  >
                    Foncé
                  </Button>
                </div>
              </div>

              {/* Saturation */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                <div style={{ width: '24px', height: '24px', marginBottom: '8px', borderRadius: '50%', background: 'linear-gradient(to right, #ef4444, #3b82f6)' }}></div>
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center', marginBottom: '8px' }}>Saturation</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant={settings.saturation === 50 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('saturation', 50)}
                    className="text-xs px-2 h-6"
                  >
                    Faible
                  </Button>
                  <Button
                    variant={settings.saturation === 100 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('saturation', 100)}
                    className="text-xs px-2 h-6"
                  >
                    Normal
                  </Button>
                  <Button
                    variant={settings.saturation === 150 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('saturation', 150)}
                    className="text-xs px-2 h-6"
                  >
                    Élevée
                  </Button>
                </div>
              </div>

              {/* Lecture */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', backgroundColor: 'hsl(var(--muted) / 0.2)', borderRadius: '8px', minHeight: '80px' }}>
                {settings.isReading ? (
                  <Pause size={24} style={{ marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }} />
                ) : (
                  <Play size={24} style={{ marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }} />
                )}
                <span style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center', marginBottom: '8px' }}>Lecture</span>
                <Button
                  variant={settings.isReading ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleReading}
                  className="text-xs px-3 h-6"
                >
                  {settings.isReading ? 'Arrêter' : 'Lire'}
                </Button>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAccessibility(false)}
                style={{
                  padding: '10px 20px',
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
