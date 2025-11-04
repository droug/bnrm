import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { CookieSettingsDialog } from './CookieSettingsDialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CookieSettings {
  title: string;
  message: string;
  accept_button_text: string;
  reject_button_text: string;
  settings_button_text: string;
  privacy_policy_url: string;
  cookie_policy_url: string;
  enabled: boolean;
  show_settings_button: boolean;
  position: 'top' | 'bottom';
  theme: 'light' | 'dark';
}

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent();
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('cookie_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data as CookieSettings);
      }
    } catch (error) {
      console.error('Error loading cookie settings:', error);
      // Use default settings
      setSettings({
        title: 'Nous utilisons des cookies 🍪',
        message: 'Ce site utilise des cookies pour améliorer votre expérience.',
        accept_button_text: 'Accepter tous les cookies',
        reject_button_text: 'Refuser',
        settings_button_text: 'Paramètres des cookies',
        privacy_policy_url: '/privacy-policy',
        cookie_policy_url: '/cookie-policy',
        enabled: true,
        show_settings_button: true,
        position: 'bottom',
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !showBanner || !settings || !settings.enabled) {
    return null;
  }

  const isDark = settings.theme === 'dark';
  const isTop = settings.position === 'top';

  return (
    <>
      <div
        className={cn(
          'fixed left-0 right-0 z-50 p-4 animate-slide-up',
          isTop ? 'top-0' : 'bottom-0'
        )}
      >
        <Card
          className={cn(
            'max-w-4xl mx-auto shadow-2xl border-2',
            isDark
              ? 'bg-gray-900 border-gray-700 text-white'
              : 'bg-white border-gray-200'
          )}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cookie className={cn('h-8 w-8', isDark ? 'text-amber-400' : 'text-primary')} />
                <h3 className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-foreground')}>
                  {settings.title}
                </h3>
              </div>
            </div>

            <p className={cn('mb-6 leading-relaxed', isDark ? 'text-gray-300' : 'text-muted-foreground')}>
              {settings.message}
            </p>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-2 text-sm">
                <a
                  href={settings.privacy_policy_url}
                  className={cn('underline hover:no-underline', isDark ? 'text-blue-400' : 'text-primary')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Politique de confidentialité
                </a>
                <span className={isDark ? 'text-gray-500' : 'text-muted-foreground'}>•</span>
                <a
                  href={settings.cookie_policy_url}
                  className={cn('underline hover:no-underline', isDark ? 'text-blue-400' : 'text-primary')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Politique des cookies
                </a>
              </div>

              <div className="flex gap-3 flex-wrap">
                {settings.show_settings_button && (
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className={cn(
                      isDark
                        ? 'border-gray-600 text-white hover:bg-gray-800'
                        : 'border-gray-300'
                    )}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {settings.settings_button_text}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={rejectAll}
                  className={cn(
                    isDark
                      ? 'border-gray-600 text-white hover:bg-gray-800'
                      : 'border-gray-300'
                  )}
                >
                  {settings.reject_button_text}
                </Button>
                <Button
                  onClick={acceptAll}
                  className={cn(
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {settings.accept_button_text}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {showSettings && (
        <CookieSettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}
    </>
  );
}
