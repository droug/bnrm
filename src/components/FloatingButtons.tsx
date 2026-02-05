import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Accessibility, X, RotateCcw, MousePointer, Type, Eye, Play, Pause } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import SmartChatBot from "@/components/SmartChatBot";
import { Slider } from "@/components/ui/slider";

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

export function FloatingButtons() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const { language } = useLanguage();

  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--cursor-size', `${settings.cursorSize}`);
    root.style.setProperty('--font-size-multiplier', `${settings.fontSize / 100}`);
    root.style.setProperty('--letter-spacing', `${settings.letterSpacing}px`);
    root.style.setProperty('--word-spacing', `${settings.wordSpacing}px`);
    root.style.setProperty('--line-height-add', `${settings.lineHeight * 0.1}`);
    
    document.body.className = document.body.className.replace(/contrast-\w+/g, '');
    if (settings.contrast !== 'normal') {
      document.body.classList.add(`contrast-${settings.contrast}`);
    }

    // Appliquer la saturation (NE PAS appliquer de filter quand saturation=100 sinon cela casse les modales position:fixed)
    document.body.style.filter = settings.saturation === 100 ? '' : `saturate(${settings.saturation}%)`;
    
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
      const text = document.body.innerText;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'fr' ? 'fr-FR' : 'ar-SA';
        window.speechSynthesis.speak(utterance);
        updateSetting('isReading', true);
        utterance.onend = () => updateSetting('isReading', false);
      }
    } else {
      window.speechSynthesis.cancel();
      updateSetting('isReading', false);
    }
  };

  return (
    <>
      {/* Floating buttons container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {/* Accessibility button */}
        <Button
          size="lg"
          onClick={() => setShowAccessibility(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 bnrm-btn-primary"
          title={language === 'ar' ? 'أدوات إمكانية الوصول' : 'Outils d\'accessibilité'}
        >
          <Accessibility className="h-6 w-6" />
        </Button>

        {/* Chatbot button */}
        <Button
          size="lg"
          onClick={() => setIsChatBotOpen(!isChatBotOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 relative bnrm-btn-primary"
          title={language === 'ar' ? 'المساعد الذكي' : 'Assistant IA'}
        >
          <Bot className="h-6 w-6" />
          {!isChatBotOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white"></div>
          )}
        </Button>
      </div>

      {/* Accessibility Modal */}
      {showAccessibility && (
        <>
          <div
            onClick={() => setShowAccessibility(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000]"
          />
          
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg p-6 max-w-lg w-[90%] shadow-2xl z-[10001]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                {language === 'ar' ? 'أدوات إمكانية الوصول' : 'Accessibilité'}
              </h2>
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                {language === 'ar' ? 'إعادة تعيين' : 'Réinitialiser'}
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              {language === 'ar' 
                ? 'اضبط إعدادات إمكانية الوصول لتحسين تجربتك'
                : 'Ajustez les paramètres pour améliorer votre expérience'
              }
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Cursor Size */}
              <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                <MousePointer className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium mb-2">{language === 'ar' ? 'المؤشر' : 'Curseur'}</span>
                <Slider
                  value={[settings.cursorSize]}
                  onValueChange={([value]) => updateSetting('cursorSize', value)}
                  min={1}
                  max={3}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Font Size */}
              <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                <Type className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium mb-1">{language === 'ar' ? 'حجم النص' : 'Taille'}</span>
                <span className="text-xs text-muted-foreground mb-2">{settings.fontSize}%</span>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={75}
                  max={150}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                <Eye className="h-6 w-6 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium mb-2">{language === 'ar' ? 'التباين' : 'Contraste'}</span>
                <div className="flex gap-2">
                  <Button
                    variant={settings.contrast === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('contrast', 'normal')}
                    className="text-xs h-7 px-2"
                  >
                    {language === 'ar' ? 'عادي' : 'Normal'}
                  </Button>
                  <Button
                    variant={settings.contrast === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('contrast', 'dark')}
                    className="text-xs h-7 px-2"
                  >
                    {language === 'ar' ? 'داكن' : 'Foncé'}
                  </Button>
                </div>
              </div>

              {/* Reading */}
              <div className="flex flex-col items-center p-4 bg-muted/20 rounded-lg">
                {settings.isReading ? <Pause className="h-6 w-6 mb-2 text-muted-foreground" /> : <Play className="h-6 w-6 mb-2 text-muted-foreground" />}
                <span className="text-sm font-medium mb-2">{language === 'ar' ? 'القراءة' : 'Lecture'}</span>
                <Button
                  variant={settings.isReading ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleReading}
                  className="text-xs h-7"
                >
                  {settings.isReading ? (language === 'ar' ? 'إيقاف' : 'Arrêter') : (language === 'ar' ? 'قراءة' : 'Lire')}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowAccessibility(false)}>
                {language === 'ar' ? 'إغلاق' : 'Fermer'}
              </Button>
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
