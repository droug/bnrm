import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Image, Save, Loader2, Upload, Trash2, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import depotLegalBg from "@/assets/depot-legal-bg.jpg";

export function ServiceBackgroundManager() {
  const [imageUrl, setImageUrl] = useState("");
  const [opacity, setOpacity] = useState(50);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", "services_page_background")
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        const val = data.setting_value as { image_url?: string; opacity?: number };
        setImageUrl(val.image_url || "");
        setOpacity(val.opacity ?? 50);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Erreur", description: "Veuillez sélectionner un fichier image", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `service-background-${Date.now()}.${fileExt}`;
      const filePath = `cms/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("cms-media")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("cms-media")
        .getPublicUrl(filePath);

      setImageUrl(urlData.publicUrl);
      toast({ title: "Succès", description: "Image téléchargée avec succès" });
    } catch (error: any) {
      toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingValue = { image_url: imageUrl, opacity };

      const { data: existing } = await supabase
        .from("cms_portal_settings")
        .select("id")
        .eq("setting_key", "services_page_background")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("cms_portal_settings")
          .update({ setting_value: settingValue as any, updated_at: new Date().toISOString() })
          .eq("setting_key", "services_page_background");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cms_portal_settings")
          .insert({
            setting_key: "services_page_background",
            setting_value: settingValue as any,
          });
        if (error) throw error;
      }

      toast({ title: "Succès", description: "Arrière-plan des pages services mis à jour" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayUrl = imageUrl || depotLegalBg;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5 text-purple-500" />
          Arrière-plan des pages Services
        </CardTitle>
        <CardDescription>
          Image d'arrière-plan partagée par toutes les pages de services (Inscription, Adhésion, Réservation, Dépôt légal, Reproduction, Restauration)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image actuelle */}
        <div className="space-y-3">
          <Label>Image actuelle</Label>
          <div className="relative rounded-xl overflow-hidden border-2 border-border group">
            <img
              src={displayUrl}
              alt="Arrière-plan des services"
              className="w-full h-52 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = depotLegalBg;
              }}
            />
            <div
              className="absolute inset-0 bg-background"
              style={{ opacity: opacity / 100 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-foreground font-medium text-lg drop-shadow-sm">
                Aperçu du rendu
              </span>
            </div>
            {!imageUrl && (
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground backdrop-blur-sm">
                  <ImageOff className="h-3 w-3" />
                  Image par défaut
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions upload / supprimer */}
        <div className="flex flex-wrap gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Téléchargement..." : "Télécharger une image"}
          </Button>
          {imageUrl && (
            <Button variant="destructive" onClick={handleRemoveImage}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer l'image
            </Button>
          )}
        </div>

        {/* URL manuelle */}
        <div className="space-y-2">
          <Label htmlFor="bg-url">Ou saisir une URL d'image</Label>
          <Input
            id="bg-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://exemple.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Laissez vide pour utiliser l'image par défaut.
          </p>
        </div>

        {/* Opacité */}
        <div className="space-y-2">
          <Label>Opacité du voile ({opacity}%)</Label>
          <Slider
            value={[opacity]}
            onValueChange={(val) => setOpacity(val[0])}
            min={10}
            max={90}
            step={5}
          />
          <p className="text-xs text-muted-foreground">
            Contrôle la transparence du voile sur l'image. Plus la valeur est élevée, moins l'image est visible.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Enregistrer
        </Button>
      </CardContent>
    </Card>
  );
}
