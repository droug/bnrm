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
    deposit_submission_enabled: true,
    deposit_validation_enabled: true,
    deposit_rejection_enabled: true,
    number_attribution_enabled: true,
    conformity_check_enabled: true,
    physical_receipt_enabled: true,
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
        .eq("parametre", "deposit_notifications");

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
          parametre: "deposit_notifications",
          valeur: JSON.stringify(settings),
          commentaire: "Paramètres de notifications pour le dépôt légal",
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
          Paramètres de Notifications du Dépôt Légal
        </CardTitle>
        <CardDescription>
          Configurez les notifications automatiques pour les différentes étapes du dépôt légal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification de soumission de dépôt */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="deposit_submission">Notification de soumission</Label>
              <p className="text-sm text-muted-foreground">
                Notifier lors de la soumission d'une nouvelle demande de dépôt légal
              </p>
            </div>
            <Switch
              id="deposit_submission"
              checked={settings.deposit_submission_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, deposit_submission_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Notification de validation */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="deposit_validation">Notification de validation</Label>
              <p className="text-sm text-muted-foreground">
                Notifier le déposant lorsque son dépôt est validé
              </p>
            </div>
            <Switch
              id="deposit_validation"
              checked={settings.deposit_validation_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, deposit_validation_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Notification de rejet */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="deposit_rejection">Notification de rejet</Label>
              <p className="text-sm text-muted-foreground">
                Notifier le déposant en cas de rejet de son dépôt
              </p>
            </div>
            <Switch
              id="deposit_rejection"
              checked={settings.deposit_rejection_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, deposit_rejection_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Notification d'attribution de numéro */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="number_attribution">
                Notification d'attribution de numéro
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifier lors de l'attribution d'un numéro ISBN/ISSN
              </p>
            </div>
            <Switch
              id="number_attribution"
              checked={settings.number_attribution_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, number_attribution_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Notification de contrôle de conformité */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="conformity_check">
                Notification de contrôle de conformité
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifier les résultats du contrôle de conformité
              </p>
            </div>
            <Switch
              id="conformity_check"
              checked={settings.conformity_check_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, conformity_check_enabled: checked })
              }
            />
          </div>
        </div>

        {/* Notification de réception physique */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="physical_receipt">
                Notification de réception physique
              </Label>
              <p className="text-sm text-muted-foreground">
                Notifier la réception des exemplaires physiques
              </p>
            </div>
            <Switch
              id="physical_receipt"
              checked={settings.physical_receipt_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, physical_receipt_enabled: checked })
              }
            />
          </div>
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
