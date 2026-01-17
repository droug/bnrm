import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, Image, Palette, Globe, Database } from "lucide-react";

export default function VExpo360Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maxPanoramasPerExhibition: 3,
    maxPanoramaSizeMB: 50,
    minPanoramaWidth: 6000,
    minPanoramaHeight: 3000,
    autoOptimizeWebP: true,
    generateThumbnails: true,
    defaultAutoRotate: false,
    defaultShowNavigationHints: true,
    defaultMinZoom: 50,
    defaultMaxZoom: 120,
    enableAnalytics: true,
    trackVisitorCount: true,
    enableBilingualAR: true,
    defaultLanguage: 'fr',
    storageProvider: 'supabase',
    cdnEnabled: false
  });

  const handleSave = () => {
    // In production, save to database or localStorage
    toast({ title: "Paramètres enregistrés", description: "Les modifications ont été sauvegardées." });
  };

  const handleReset = () => {
    setSettings({
      maxPanoramasPerExhibition: 3,
      maxPanoramaSizeMB: 50,
      minPanoramaWidth: 6000,
      minPanoramaHeight: 3000,
      autoOptimizeWebP: true,
      generateThumbnails: true,
      defaultAutoRotate: false,
      defaultShowNavigationHints: true,
      defaultMinZoom: 50,
      defaultMaxZoom: 120,
      enableAnalytics: true,
      trackVisitorCount: true,
      enableBilingualAR: true,
      defaultLanguage: 'fr',
      storageProvider: 'supabase',
      cdnEnabled: false
    });
    toast({ title: "Paramètres réinitialisés" });
  };

  return (
    <div className="space-y-6">
      {/* Panorama Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle>Paramètres des Panoramas</CardTitle>
          </div>
          <CardDescription>
            Configuration des images panoramiques 360°
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Maximum de panoramas par exposition</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={settings.maxPanoramasPerExhibition}
                onChange={(e) => setSettings({ ...settings, maxPanoramasPerExhibition: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Recommandé: 1-3 pour une meilleure expérience</p>
            </div>
            <div className="space-y-2">
              <Label>Taille maximale (Mo)</Label>
              <Input
                type="number"
                min={10}
                max={200}
                value={settings.maxPanoramaSizeMB}
                onChange={(e) => setSettings({ ...settings, maxPanoramaSizeMB: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Au-delà, un avertissement sera affiché</p>
            </div>
            <div className="space-y-2">
              <Label>Largeur minimale recommandée (px)</Label>
              <Input
                type="number"
                min={2000}
                max={16000}
                value={settings.minPanoramaWidth}
                onChange={(e) => setSettings({ ...settings, minPanoramaWidth: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hauteur minimale recommandée (px)</Label>
              <Input
                type="number"
                min={1000}
                max={8000}
                value={settings.minPanoramaHeight}
                onChange={(e) => setSettings({ ...settings, minPanoramaHeight: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Optimisation WebP automatique</Label>
                <p className="text-sm text-muted-foreground">Génère des versions WebP optimisées</p>
              </div>
              <Switch
                checked={settings.autoOptimizeWebP}
                onCheckedChange={(checked) => setSettings({ ...settings, autoOptimizeWebP: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Génération de vignettes</Label>
                <p className="text-sm text-muted-foreground">Crée automatiquement des aperçus</p>
              </div>
              <Switch
                checked={settings.generateThumbnails}
                onCheckedChange={(checked) => setSettings({ ...settings, generateThumbnails: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewer Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Paramètres de la Visionneuse</CardTitle>
          </div>
          <CardDescription>
            Configuration par défaut de l'affichage 360°
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Zoom minimum par défaut</Label>
              <Input
                type="number"
                min={30}
                max={80}
                value={settings.defaultMinZoom}
                onChange={(e) => setSettings({ ...settings, defaultMinZoom: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Zoom maximum par défaut</Label>
              <Input
                type="number"
                min={100}
                max={200}
                value={settings.defaultMaxZoom}
                onChange={(e) => setSettings({ ...settings, defaultMaxZoom: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rotation automatique par défaut</Label>
                <p className="text-sm text-muted-foreground">Active la rotation lente au chargement</p>
              </div>
              <Switch
                checked={settings.defaultAutoRotate}
                onCheckedChange={(checked) => setSettings({ ...settings, defaultAutoRotate: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Indices de navigation</Label>
                <p className="text-sm text-muted-foreground">Affiche des aides visuelles pour naviguer</p>
              </div>
              <Switch
                checked={settings.defaultShowNavigationHints}
                onCheckedChange={(checked) => setSettings({ ...settings, defaultShowNavigationHints: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language & Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Langues et Analytique</CardTitle>
          </div>
          <CardDescription>
            Paramètres de localisation et suivi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Langue par défaut</Label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية (Arabe)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Support bilingue FR/AR</Label>
                <p className="text-sm text-muted-foreground">Active les champs en arabe (RTL)</p>
              </div>
              <Switch
                checked={settings.enableBilingualAR}
                onCheckedChange={(checked) => setSettings({ ...settings, enableBilingualAR: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Suivi des visiteurs</Label>
                <p className="text-sm text-muted-foreground">Comptabilise les visites par exposition</p>
              </div>
              <Switch
                checked={settings.trackVisitorCount}
                onCheckedChange={(checked) => setSettings({ ...settings, trackVisitorCount: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytique avancée</Label>
                <p className="text-sm text-muted-foreground">Statistiques détaillées d'utilisation</p>
              </div>
              <Switch
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Stockage</CardTitle>
          </div>
          <CardDescription>
            Configuration du stockage des fichiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Fournisseur de stockage</Label>
              <select
                value={settings.storageProvider}
                onChange={(e) => setSettings({ ...settings, storageProvider: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="supabase">Supabase Storage</option>
                <option value="s3" disabled>Amazon S3 (à venir)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CDN activé</Label>
              <p className="text-sm text-muted-foreground">Distribution via réseau de diffusion de contenu</p>
            </div>
            <Switch
              checked={settings.cdnEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, cdnEnabled: checked })}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
