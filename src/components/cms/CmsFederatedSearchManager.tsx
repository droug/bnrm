import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Loader2, Save, Eye, ImageIcon, Check, X, Link as LinkIcon, RefreshCw, Search
} from "lucide-react";

interface FederatedSearchSettings {
  hero_image_url: string;
  title_fr: string;
  title_ar: string;
  subtitle_fr: string;
  subtitle_ar: string;
}

const DEFAULT_SETTINGS: FederatedSearchSettings = {
  hero_image_url: "",
  title_fr: "Recherche fédérée",
  title_ar: "البحث في الموارد الإلكترونية",
  subtitle_fr: "Interrogez simultanément toutes les bases de données électroniques",
  subtitle_ar: "ابحث في جميع قواعد البيانات الإلكترونية في وقت واحد",
};

const SETTING_KEY = "federated_search_hero";

export default function CmsFederatedSearchManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<FederatedSearchSettings>(DEFAULT_SETTINGS);

  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["federated-search-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_portal_settings")
        .select("setting_value")
        .eq("setting_key", SETTING_KEY)
        .maybeSingle();
      if (error) throw error;
      return data?.setting_value as unknown as FederatedSearchSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData({ ...DEFAULT_SETTINGS, ...settings });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: FederatedSearchSettings) => {
      const { error } = await supabase
        .from("cms_portal_settings")
        .upsert(
          { setting_key: SETTING_KEY, setting_value: data as any, updated_at: new Date().toISOString() },
          { onConflict: "setting_key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["federated-search-settings"] });
      toast({ title: "Paramètres sauvegardés", description: "La Recherche fédérée a été mise à jour." });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 10 Mo", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const sanitized = file.name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
      const fileName = `federated-search/${Date.now()}-${sanitized}`;
      const { error: uploadError } = await supabase.storage.from("cms-media").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("cms-media").getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, hero_image_url: publicUrl }));
      toast({ title: "Image téléchargée avec succès" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gold-bn-primary" />
              Configuration — Recherche fédérée
            </CardTitle>
            <CardDescription>
              Personnalisez l'image de fond, le titre et le sous-titre de la page de Recherche fédérée
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="gap-2">
              <Eye className="h-4 w-4" />
              {previewMode ? "Masquer" : "Aperçu"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Image de fond */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Image de fond</Label>
            <div className="grid md:grid-cols-[300px_1fr] gap-6">
              {/* Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gold-bn-primary/30 bg-muted">
                {formData.hero_image_url ? (
                  <>
                    <img src={formData.hero_image_url} alt="Aperçu" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-bn-blue-primary/50" />
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => setFormData(prev => ({ ...prev, hero_image_url: "" }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Badge className="absolute bottom-2 left-2 bg-gold-bn-primary text-white">
                      <Check className="h-3 w-3 mr-1" /> Image configurée
                    </Badge>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <span className="text-sm">Aucune image</span>
                  </div>
                )}
              </div>
              {/* Upload controls */}
              <div className="space-y-4">
                <div className="relative inline-block">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} onChange={handleImageUpload} />
                  <Button type="button" variant="outline" disabled={isUploading} className="gap-2">
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? "Téléchargement..." : "Télécharger une image"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" /> ou entrer une URL
                  </Label>
                  <Input
                    type="url"
                    value={formData.hero_image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <p className="text-xs text-muted-foreground">Format recommandé : 1920×1080 px, JPEG ou WebP, max 10 Mo</p>
              </div>
            </div>
          </div>

          {/* Textes bilingues */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Textes de la section Hero</Label>
            <Tabs defaultValue="fr">
              <TabsList>
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                <TabsTrigger value="ar">🇲🇦 العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="fr" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Titre principal (FR)</Label>
                  <Input
                    value={formData.title_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                    placeholder="Recherche fédérée"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sous-titre (FR)</Label>
                  <Textarea
                    value={formData.subtitle_fr}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_fr: e.target.value }))}
                    placeholder="Interrogez simultanément toutes les bases de données électroniques"
                    rows={3}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ar" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>العنوان الرئيسي (AR)</Label>
                  <Input
                    dir="rtl"
                    value={formData.title_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                    placeholder="البحث في الموارد الإلكترونية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان الفرعي (AR)</Label>
                  <Textarea
                    dir="rtl"
                    value={formData.subtitle_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_ar: e.target.value }))}
                    placeholder="ابحث في جميع قواعد البيانات الإلكترونية في وقت واحد"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Aperçu */}
          {previewMode && (
            <div
              className="relative aspect-[21/9] rounded-xl overflow-hidden border shadow-lg"
              style={{
                backgroundImage: formData.hero_image_url ? `url(${formData.hero_image_url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: formData.hero_image_url ? undefined : "hsl(var(--muted))",
              }}
            >
              <div className="absolute inset-0 bg-bn-blue-primary/70 backdrop-blur-[2px]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                <Badge className="mb-4 bg-gold-bn-primary/20 text-gold-bn-primary border border-gold-bn-primary/40">
                  Aperçu — Recherche fédérée
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {formData.title_fr || "Recherche fédérée"}
                </h1>
                <p className="text-lg text-white/80 max-w-xl">
                  {formData.subtitle_fr || "Sous-titre"}
                </p>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-2 border-t">
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              className="gap-2 bg-bn-blue-primary hover:bg-bn-blue-primary/90"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
