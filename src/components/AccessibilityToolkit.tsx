import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Accessibility, 
  RotateCcw, 
  MousePointer, 
  Type, 
  Eye, 
  Play,
  Pause
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

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

export const AccessibilityToolkit = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const { t } = useLanguage();

  console.log('AccessibilityToolkit rendered');

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
    
    // Appliquer la saturation
    document.body.style.filter = `saturate(${settings.saturation}%)`;
    
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
      {/* Bouton dans le header */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <Accessibility className="h-4 w-4" />
      </Button>

      {/* Dialog d'accessibilité */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Accessibilité</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSettings}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Grille des contrôles */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Curseur */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <MousePointer className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium mb-2">Curseur</span>
              <Slider
                value={[settings.cursorSize]}
                onValueChange={([value]) => updateSetting('cursorSize', value)}
                min={1}
                max={3}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Espacement des mots */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <div className="text-lg mb-2 text-muted-foreground font-bold">H</div>
              <span className="text-sm font-medium mb-1">Espacement des mots</span>
              <span className="text-xs text-muted-foreground mb-2">{settings.wordSpacing}px</span>
              <Slider
                value={[settings.wordSpacing]}
                onValueChange={([value]) => updateSetting('wordSpacing', value)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Espacement des lettres */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <div className="text-lg mb-2 text-muted-foreground font-bold">A a</div>
              <span className="text-sm font-medium mb-1">Espacement des lettres</span>
              <span className="text-xs text-muted-foreground mb-2">{settings.letterSpacing}px</span>
              <Slider
                value={[settings.letterSpacing]}
                onValueChange={([value]) => updateSetting('letterSpacing', value)}
                min={0}
                max={5}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Espacement des lignes */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <div className="text-lg mb-2 text-muted-foreground">≡</div>
              <span className="text-sm font-medium mb-1">Espacement des lignes</span>
              <span className="text-xs text-muted-foreground mb-2">{settings.lineHeight}px</span>
              <Slider
                value={[settings.lineHeight]}
                onValueChange={([value]) => updateSetting('lineHeight', value)}
                min={0}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* Taille de texte */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <Type className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium mb-2">Taille de texte</span>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSetting('fontSize', value)}
                min={75}
                max={150}
                step={5}
                className="w-full"
              />
            </div>

            {/* Contraste */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <Eye className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-sm font-medium mb-2">Contraste</span>
              <div className="flex gap-1">
                <Button
                  variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('contrast', 'normal')}
                  className="text-xs px-2"
                >
                  Normal
                </Button>
                <Button
                  variant={settings.contrast === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('contrast', 'light')}
                  className="text-xs px-2"
                >
                  Léger
                </Button>
                <Button
                  variant={settings.contrast === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('contrast', 'dark')}
                  className="text-xs px-2"
                >
                  Foncé
                </Button>
              </div>
            </div>

            {/* Saturation */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              <div className="w-6 h-6 mb-2 rounded-full bg-gradient-to-r from-red-500 to-blue-500"></div>
              <span className="text-sm font-medium mb-2">Saturation</span>
              <div className="flex gap-1">
                <Button
                  variant={settings.saturation === 50 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('saturation', 50)}
                  className="text-xs px-2"
                >
                  Faible
                </Button>
                <Button
                  variant={settings.saturation === 100 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('saturation', 100)}
                  className="text-xs px-2"
                >
                  Normal
                </Button>
                <Button
                  variant={settings.saturation === 150 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateSetting('saturation', 150)}
                  className="text-xs px-2"
                >
                  Élevée
                </Button>
              </div>
            </div>

            {/* Lecture */}
            <div className="flex flex-col items-center p-3 rounded-lg bg-accent/20">
              {settings.isReading ? (
                <Pause className="h-6 w-6 mb-2 text-muted-foreground" />
              ) : (
                <Play className="h-6 w-6 mb-2 text-muted-foreground" />
              )}
              <span className="text-sm font-medium mb-2">Lecture</span>
              <Button
                variant={settings.isReading ? 'default' : 'outline'}
                size="sm"
                onClick={toggleReading}
                className="w-full"
              >
                {settings.isReading ? 'Arrêter' : 'Lire'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};