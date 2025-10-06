import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Save, Loader2 } from "lucide-react";

export function BNRMPaymentNotificationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_reminder_enabled: true,
    days_before_due: 7,
    overdue_reminder_enabled: true,
    overdue_reminder_frequency: 3,
    subscription_expiry_enabled: true,
    days_before_expiry: 15,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bnrm_parametres")
        .select("*")
        .eq("parametre", "payment_notifications");

      if (error) throw error;

      if (data && data.length > 0) {
        const savedSettings = JSON.parse(data[0].valeur);
        setSettings(savedSettings);
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from("bnrm_parametres")
        .upsert({
          parametre: "payment_notifications",
          valeur: JSON.stringify(settings),
          commentaire: "Paramètres de notifications de paiement pour les abonnements",
        }, {
          onConflict: "parametre"
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les paramètres ont été enregistrés",
      });
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les paramètres",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Paramètres de Notifications de Paiement
        </CardTitle>
        <CardDescription>
          Configurez les notifications automatiques pour les paiements d'abonnements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rappel de paiement avant échéance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="payment_reminder">Rappel avant échéance</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer un rappel avant la date d'échéance du paiement
              </p>
            </div>
            <Switch
              id="payment_reminder"
              checked={settings.payment_reminder_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, payment_reminder_enabled: checked })
              }
            />
          </div>

          {settings.payment_reminder_enabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="days_before_due">
                Nombre de jours avant l'échéance
              </Label>
              <Input
                id="days_before_due"
                type="number"
                min="1"
                max="30"
                value={settings.days_before_due}
                onChange={(e) =>
                  setSettings({ ...settings, days_before_due: parseInt(e.target.value) })
                }
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Envoyer un rappel {settings.days_before_due} jour(s) avant la date d'échéance
              </p>
            </div>
          )}
        </div>

        {/* Rappel de paiement en retard */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="overdue_reminder">Rappel de paiement en retard</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des rappels pour les paiements en retard
              </p>
            </div>
            <Switch
              id="overdue_reminder"
              checked={settings.overdue_reminder_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, overdue_reminder_enabled: checked })
              }
            />
          </div>

          {settings.overdue_reminder_enabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="overdue_frequency">
                Fréquence des rappels (en jours)
              </Label>
              <Input
                id="overdue_frequency"
                type="number"
                min="1"
                max="30"
                value={settings.overdue_reminder_frequency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    overdue_reminder_frequency: parseInt(e.target.value),
                  })
                }
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Envoyer un rappel tous les {settings.overdue_reminder_frequency} jour(s) après l'échéance
              </p>
            </div>
          )}
        </div>

        {/* Rappel avant expiration de l'abonnement */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="subscription_expiry">
                Rappel avant expiration de l'abonnement
              </Label>
              <p className="text-sm text-muted-foreground">
                Prévenir avant l'expiration de l'abonnement
              </p>
            </div>
            <Switch
              id="subscription_expiry"
              checked={settings.subscription_expiry_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, subscription_expiry_enabled: checked })
              }
            />
          </div>

          {settings.subscription_expiry_enabled && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="days_before_expiry">
                Nombre de jours avant expiration
              </Label>
              <Input
                id="days_before_expiry"
                type="number"
                min="1"
                max="60"
                value={settings.days_before_expiry}
                onChange={(e) =>
                  setSettings({ ...settings, days_before_expiry: parseInt(e.target.value) })
                }
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">
                Envoyer une notification {settings.days_before_expiry} jour(s) avant l'expiration
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les paramètres
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
