import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Loader2, 
  Save, 
  Eye, 
  ImageIcon,
  Check,
  X,
  Link as LinkIcon,
  RefreshCw,
  BookOpen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface HeroSettings {
  id: string;
  platform: string;
  hero_image_url: string | null;
  hero_title_fr: string | null;
  hero_title_ar: string | null;
  hero_subtitle_fr: string | null;
  hero_subtitle_ar: string | null;
  hero_cta_label_fr: string | null;
  hero_cta_label_ar: string | null;
  hero_cta_url: string | null;
  hero_secondary_cta_label_fr: string | null;
  hero_secondary_cta_label_ar: string | null;
  hero_secondary_cta_url: string | null;
  updated_at: string | null;
}

export default function CmsHeroManagerBN() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<HeroSettings>>({
    hero_image_url: "",
    hero_title_fr: "",
    hero_title_ar: "",
    hero_subtitle_fr: "",
    hero_subtitle_ar: "",
    hero_cta_label_fr: "",
    hero_cta_label_ar: "",
    hero_cta_url: "",
    hero_secondary_cta_label_fr: "",
    hero_secondary_cta_label_ar: "",
    hero_secondary_cta_url: "",
  });

  // Fetch hero settings for BN (Bibliothèque Numérique) platform
  const { data: heroSettings, isLoading, refetch } = useQuery({
    queryKey: ['hero-settings-bn'],
    queryFn: async (): Promise<HeroSettings | null> => {
      const { data, error } = await (supabase as any)
        .from('cms_hero_settings')
        .select('*')
        .eq('platform', 'bn')
        .single();
      
      if (error && error.code === 'PGRST116') {
        return null;
      }
      
      if (error) throw error;
      return data as HeroSettings;
    }
  });

  // Update form when data loads
  useEffect(() => {
    if (heroSettings) {
      setFormData({
        hero_image_url: heroSettings.hero_image_url || "",
        hero_title_fr: heroSettings.hero_title_fr || "",
        hero_title_ar: heroSettings.hero_title_ar || "",
        hero_subtitle_fr: heroSettings.hero_subtitle_fr || "",
        hero_subtitle_ar: heroSettings.hero_subtitle_ar || "",
        hero_cta_label_fr: heroSettings.hero_cta_label_fr || "",
        hero_cta_label_ar: heroSettings.hero_cta_label_ar || "",
        hero_cta_url: heroSettings.hero_cta_url || "",
        hero_secondary_cta_label_fr: heroSettings.hero_secondary_cta_label_fr || "",
        hero_secondary_cta_label_ar: heroSettings.hero_secondary_cta_label_ar || "",
        hero_secondary_cta_url: heroSettings.hero_secondary_cta_url || "",
      });
    }
  }, [heroSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<HeroSettings>) => {
      if (!heroSettings?.id) throw new Error("No settings found");
      
      const { error } = await (supabase as any)
        .from('cms_hero_settings')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', heroSettings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hero-settings-bn"] });
      queryClient.invalidateQueries({ queryKey: ["cms-hero-settings-bn"] });
      queryClient.invalidateQueries({ queryKey: ["cms-hero-settings-digital-library"] });
      queryClient.invalidateQueries({ queryKey: ["cms-hero-settings-digital-library-home"] });
      
      toast({
        title: "Paramètres Hero BN sauvegardés",
        description: "Les modifications seront visibles sur la Bibliothèque Numérique.",
      });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 10 Mo", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const sanitizedName = file.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      
      const fileName = `hero-bn/${Date.now()}-${sanitizedName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('cms-media')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, hero_image_url: publicUrl }));
      toast({ title: "Image téléchargée avec succès" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
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
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Configuration du Hero - Bibliothèque Numérique
            </CardTitle>
            <CardDescription>
              Personnalisez l'image et le contenu de la section Hero de la plateforme Ibn Battuta
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {previewMode ? "Masquer" : "Aperçu"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Image de fond de la Bibliothèque Numérique</Label>
              
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-indigo-500/30 bg-muted">
                  {formData.hero_image_url ? (
                    <>
                      <img 
                        src={formData.hero_image_url} 
                        alt="Hero preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => setFormData(prev => ({ ...prev, hero_image_url: "" }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-2 left-2 bg-indigo-600">
                        <Check className="h-3 w-3 mr-1" />
                        Image BN configurée
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
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                      />
                      <Button type="button" variant="outline" disabled={isUploading} className="gap-2">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {isUploading ? "Téléchargement..." : "Télécharger une image"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      ou entrer une URL
                    </Label>
                    <Input
                      type="url"
                      value={formData.hero_image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_image_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Format recommandé : 1920x1080 pixels, JPEG ou WebP, max 10 Mo
                  </p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <Tabs defaultValue="fr" className="space-y-4">
              <TabsList>
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                <TabsTrigger value="ar">🇲🇦 العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="fr" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titre principal (FR)</Label>
                    <Input
                      value={formData.hero_title_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_title_fr: e.target.value }))}
                      placeholder="Bibliothèque Numérique Ibn Battuta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sous-titre (FR)</Label>
                    <Input
                      value={formData.hero_subtitle_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_subtitle_fr: e.target.value }))}
                      placeholder="Explorez notre patrimoine numérisé"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bouton principal - Label (FR)</Label>
                    <Input
                      value={formData.hero_cta_label_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_cta_label_fr: e.target.value }))}
                      placeholder="Explorer les collections"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bouton principal - URL</Label>
                    <Input
                      value={formData.hero_cta_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_cta_url: e.target.value }))}
                      placeholder="/digital-library/collections"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bouton secondaire - Label (FR)</Label>
                    <Input
                      value={formData.hero_secondary_cta_label_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_secondary_cta_label_fr: e.target.value }))}
                      placeholder="Manuscrits"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bouton secondaire - URL</Label>
                    <Input
                      value={formData.hero_secondary_cta_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_secondary_cta_url: e.target.value }))}
                      placeholder="/digital-library/collections/manuscripts"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ar" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>العنوان الرئيسي (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.hero_title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_title_ar: e.target.value }))}
                      placeholder="مكتبة ابن بطوطة الرقمية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان الفرعي (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.hero_subtitle_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_subtitle_ar: e.target.value }))}
                      placeholder="اكتشفوا تراثنا الرقمي"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الزر الرئيسي - النص (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.hero_cta_label_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_cta_label_ar: e.target.value }))}
                      placeholder="استكشاف المجموعات"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الزر الثانوي - النص (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.hero_secondary_cta_label_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, hero_secondary_cta_label_ar: e.target.value }))}
                      placeholder="المخطوطات"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            {previewMode && formData.hero_image_url && (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden border shadow-lg">
                <img 
                  src={formData.hero_image_url} 
                  alt="Hero preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                  <Badge className="mb-4 bg-indigo-600">Aperçu Bibliothèque Numérique</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {formData.hero_title_fr || "Titre principal"}
                  </h1>
                  <p className="text-lg opacity-90 mb-6">
                    {formData.hero_subtitle_fr || "Sous-titre"}
                  </p>
                  <div className="flex gap-4">
                    {formData.hero_cta_label_fr && (
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        {formData.hero_cta_label_fr}
                      </Button>
                    )}
                    {formData.hero_secondary_cta_label_fr && (
                      <Button variant="outline" className="border-white text-white hover:bg-white/20">
                        {formData.hero_secondary_cta_label_fr}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Sauvegarder les paramètres BN
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
