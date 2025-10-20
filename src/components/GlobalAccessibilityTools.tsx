import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accessibility, MessageCircle, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLanguage } from '@/hooks/useLanguage';
import ChatBot from './ChatBot';

/**
 * Composant global qui fournit les outils d'accessibilité et le chatbot
 * sur toutes les interfaces du système
 */
export function GlobalAccessibilityTools() {
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const { t } = useLanguage();

  const applyFontSize = (value: number) => {
    setFontSize(value);
    document.documentElement.style.fontSize = `${value}%`;
  };

  const toggleContrast = () => {
    const newContrast = contrast === 'normal' ? 'high' : 'normal';
    setContrast(newContrast);
    if (newContrast === 'high') {
      document.body.classList.add('contrast-dark');
    } else {
      document.body.classList.remove('contrast-dark');
    }
  };

  const resetSettings = () => {
    setFontSize(100);
    setContrast('normal');
    document.documentElement.style.fontSize = '100%';
    document.body.classList.remove('contrast-dark');
  };

  return (
    <>
      {/* Boutons flottants fixes en bas à droite */}
      <div 
        className="fixed flex flex-col gap-3"
        style={{ 
          bottom: '24px',
          right: '24px',
          zIndex: 10000,
          pointerEvents: 'auto'
        }}
        role="toolbar"
        aria-label="Outils d'assistance"
      >
        {/* Bouton Accessibilité */}
        <Button
          size="lg"
          onClick={() => setShowAccessibility(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90"
          style={{ pointerEvents: 'auto' }}
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
          style={{ pointerEvents: 'auto' }}
          aria-label={showChatbot ? "Fermer l'assistant virtuel" : "Ouvrir l'assistant virtuel"}
          title="Assistant virtuel"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>

      {/* Dialog d'accessibilité */}
      <Dialog open={showAccessibility} onOpenChange={setShowAccessibility}>
        <DialogContent className="sm:max-w-md" style={{ zIndex: 10001 }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibilité
            </DialogTitle>
            <DialogDescription>
              Personnalisez l'affichage selon vos besoins
            </DialogDescription>
          </DialogHeader>

          <div className="spacing-content">
            {/* Taille du texte */}
            <div>
              <label className="text-sm font-medium mb-2 block">
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

            {/* Contraste */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Contraste
              </label>
              <Button
                onClick={toggleContrast}
                variant={contrast === 'high' ? 'default' : 'outline'}
                className="w-full"
              >
                {contrast === 'high' ? 'Contraste élevé activé' : 'Activer contraste élevé'}
              </Button>
            </div>

            {/* Réinitialiser */}
            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chatbot */}
      {showChatbot && (
        <div 
          className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)]"
          style={{ zIndex: 10000 }}
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
