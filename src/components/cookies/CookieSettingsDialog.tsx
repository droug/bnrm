import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { BarChart3, Target, Wrench } from 'lucide-react';

interface CookieSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieSettingsDialog({ open, onOpenChange }: CookieSettingsDialogProps) {
  const { acceptCustom } = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const functional = true; // Always true, non-modifiable

  const handleSave = () => {
    acceptCustom({ analytics, marketing, functional });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Paramètres des cookies</DialogTitle>
          <DialogDescription>
            Gérez vos préférences en matière de cookies. Vous pouvez modifier ces paramètres à tout moment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cookies fonctionnels (obligatoires) */}
          <div className="flex items-start justify-between space-x-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Cookies fonctionnels</Label>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Obligatoires</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                Ils permettent la navigation de base, la gestion de session et l'accessibilité.
              </p>
            </div>
            <Switch checked={true} disabled className="mt-2" />
          </div>

          {/* Cookies analytiques */}
          <div className="flex items-start justify-between space-x-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <Label htmlFor="analytics-cookies" className="text-base font-semibold cursor-pointer">
                  Cookies analytiques
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Ces cookies nous permettent de comprendre comment vous utilisez notre site via Google Analytics.
                Ils nous aident à améliorer l'expérience utilisateur et les performances du site.
              </p>
            </div>
            <Switch
              id="analytics-cookies"
              checked={analytics}
              onCheckedChange={setAnalytics}
              className="mt-2"
            />
          </div>

          {/* Cookies marketing */}
          <div className="flex items-start justify-between space-x-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <Label htmlFor="marketing-cookies" className="text-base font-semibold cursor-pointer">
                  Cookies marketing
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Ces cookies sont utilisés pour afficher des publicités pertinentes et mesurer l'efficacité
                de nos campagnes marketing.
              </p>
            </div>
            <Switch
              id="marketing-cookies"
              checked={marketing}
              onCheckedChange={setMarketing}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer les préférences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
