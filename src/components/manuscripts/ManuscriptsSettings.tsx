import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ViewerSettings {
  id?: string;
  block_right_click_default: boolean;
  block_screenshot_default: boolean;
  allow_download_default: boolean;
  allow_print_default: boolean;
  allow_email_share_default: boolean;
  max_zoom: number;
  min_zoom: number;
  default_view_mode: "single" | "double";
}

export function ManuscriptsSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ViewerSettings>({
    block_right_click_default: false,
    block_screenshot_default: false,
    allow_download_default: true,
    allow_print_default: true,
    allow_email_share_default: true,
    max_zoom: 200,
    min_zoom: 50,
    default_view_mode: "single"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscript_viewer_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettings({
          ...data,
          default_view_mode: (data.default_view_mode as "single" | "double") || "single"
        });
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('manuscript_viewer_settings')
          .update(settings)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('manuscript_viewer_settings')
          .insert([settings]);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Paramètres enregistrés avec succès",
      });

      fetchSettings();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Paramètres du Visualiseur de Manuscrits
        </CardTitle>
        <CardDescription>
          Configuration par défaut pour la consultation des manuscrits numérisés
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Sécurité et Protection</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="block_right_click">Bloquer le clic droit par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Empêche les utilisateurs de faire un clic droit sur les manuscrits
              </p>
            </div>
            <Switch
              id="block_right_click"
              checked={settings.block_right_click_default}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, block_right_click_default: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="block_screenshot">Bloquer les captures d'écran par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Tente d'empêcher les captures d'écran (PrintScreen, etc.)
              </p>
            </div>
            <Switch
              id="block_screenshot"
              checked={settings.block_screenshot_default}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, block_screenshot_default: checked })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Fonctionnalités Autorisées</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_download">Autoriser le téléchargement par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs peuvent télécharger les manuscrits
              </p>
            </div>
            <Switch
              id="allow_download"
              checked={settings.allow_download_default}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, allow_download_default: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_print">Autoriser l'impression par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs peuvent imprimer les manuscrits
              </p>
            </div>
            <Switch
              id="allow_print"
              checked={settings.allow_print_default}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, allow_print_default: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow_email">Autoriser le partage par email par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Les utilisateurs peuvent envoyer le manuscrit par email
              </p>
            </div>
            <Switch
              id="allow_email"
              checked={settings.allow_email_share_default}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, allow_email_share_default: checked })
              }
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Paramètres de Visualisation</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_zoom">Zoom minimum (%)</Label>
              <Input
                id="min_zoom"
                type="number"
                value={settings.min_zoom}
                onChange={(e) => setSettings({ ...settings, min_zoom: parseInt(e.target.value) || 50 })}
                min={10}
                max={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_zoom">Zoom maximum (%)</Label>
              <Input
                id="max_zoom"
                type="number"
                value={settings.max_zoom}
                onChange={(e) => setSettings({ ...settings, max_zoom: parseInt(e.target.value) || 200 })}
                min={100}
                max={400}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="view_mode">Mode d'affichage par défaut</Label>
            <Select 
              value={settings.default_view_mode} 
              onValueChange={(value: "single" | "double") => 
                setSettings({ ...settings, default_view_mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Simple page</SelectItem>
                <SelectItem value="double">Double page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
