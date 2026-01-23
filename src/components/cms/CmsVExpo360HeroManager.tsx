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
  View
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface VExpoHeroSettings {
  id: string;
  setting_key: string;
  setting_value: {
    image_url?: string;
    title_fr?: string;
    title_ar?: string;
    subtitle_fr?: string;
    subtitle_ar?: string;
    cta_label_fr?: string;
    cta_label_ar?: string;
    cta_url?: string;
    secondary_cta_label_fr?: string;
    secondary_cta_label_ar?: string;
    secondary_cta_url?: string;
  };
}

export default function CmsVExpo360HeroManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    image_url: "",
    title_fr: "",
    title_ar: "",
    subtitle_fr: "",
    subtitle_ar: "",
    cta_label_fr: "",
    cta_label_ar: "",
    cta_url: "",
    secondary_cta_label_fr: "",
    secondary_cta_label_ar: "",
    secondary_cta_url: "",
  });

  // Fetch VExpo hero settings from cms_portal_settings
  const { data: vexpoSettings, isLoading, refetch } = useQuery({
    queryKey: ['vexpo-hero-settings'],
    queryFn: async (): Promise<VExpoHeroSettings | null> => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('*')
        .eq('setting_key', 'vexpo_hero_bn')
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Create default entry if not exists
        const defaultSettings = {
          setting_key: 'vexpo_hero_bn',
          category: 'vexpo',
          description: 'Paramètres Hero de la section Exposition Virtuelle 360° (BN)',
          setting_value: {
            image_url: "",
            title_fr: "Exposition Virtuelle",
            title_ar: "معرض افتراضي",
            subtitle_fr: "Découvrez nos expositions virtuelles immersives en 360°",
            subtitle_ar: "اكتشفوا معارضنا الافتراضية الغامرة بزاوية 360 درجة",
            cta_label_fr: "Découvrir",
            cta_label_ar: "اكتشف",
            cta_url: "/digital-library/exposition-virtuelle",
            secondary_cta_label_fr: "",
            secondary_cta_label_ar: "",
            secondary_cta_url: "",
          }
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('cms_portal_settings')
          .insert(defaultSettings)
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData as VExpoHeroSettings;
      }
      
      if (error) throw error;
      return data as VExpoHeroSettings;
    }
  });

  // Update form when data loads
  useEffect(() => {
    if (vexpoSettings?.setting_value) {
      const sv = vexpoSettings.setting_value;
      setFormData({
        image_url: sv.image_url || "",
        title_fr: sv.title_fr || "",
        title_ar: sv.title_ar || "",
        subtitle_fr: sv.subtitle_fr || "",
        subtitle_ar: sv.subtitle_ar || "",
        cta_label_fr: sv.cta_label_fr || "",
        cta_label_ar: sv.cta_label_ar || "",
        cta_url: sv.cta_url || "",
        secondary_cta_label_fr: sv.secondary_cta_label_fr || "",
        secondary_cta_label_ar: sv.secondary_cta_label_ar || "",
        secondary_cta_url: sv.secondary_cta_url || "",
      });
    }
  }, [vexpoSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!vexpoSettings?.id) throw new Error("No settings found");
      
      const { error } = await supabase
        .from('cms_portal_settings')
        .update({
          setting_value: data,
          updated_at: new Date().toISOString()
        })
        .eq('id', vexpoSettings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vexpo-hero-settings"] });
      
      toast({
        title: "Paramètres VExpo 360° sauvegardés",
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
      
      const fileName = `vexpo-hero/${Date.now()}-${sanitizedName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('cms-media')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
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
              <View className="h-5 w-5 text-amber-600" />
              Section Exposition Virtuelle 360° - Accueil BN
            </CardTitle>
            <CardDescription>
              Personnalisez l'image et le contenu de la section Exposition Virtuelle sur la page d'accueil
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
              <Label className="text-base font-semibold">Image de fond de la section</Label>
              
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                {/* Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-dashed border-amber-500/30 bg-muted">
                  {formData.image_url ? (
                    <>
                      <img 
                        src={formData.image_url} 
                        alt="VExpo preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute bottom-2 left-2 bg-amber-600">
                        <Check className="h-3 w-3 mr-1" />
                        Image configurée
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
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
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
                      value={formData.title_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                      placeholder="Exposition Virtuelle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sous-titre (FR)</Label>
                    <Input
                      value={formData.subtitle_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle_fr: e.target.value }))}
                      placeholder="Découvrez nos expositions virtuelles immersives"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bouton principal - Label (FR)</Label>
                    <Input
                      value={formData.cta_label_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_label_fr: e.target.value }))}
                      placeholder="Découvrir"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bouton principal - URL</Label>
                    <Input
                      value={formData.cta_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                      placeholder="/digital-library/exposition-virtuelle"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bouton secondaire - Label (FR)</Label>
                    <Input
                      value={formData.secondary_cta_label_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_cta_label_fr: e.target.value }))}
                      placeholder="En savoir plus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bouton secondaire - URL</Label>
                    <Input
                      value={formData.secondary_cta_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_cta_url: e.target.value }))}
                      placeholder="/digital-library/about"
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
                      value={formData.title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      placeholder="معرض افتراضي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان الفرعي (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.subtitle_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle_ar: e.target.value }))}
                      placeholder="اكتشفوا معارضنا الافتراضية الغامرة"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الزر الرئيسي - النص (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.cta_label_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_label_ar: e.target.value }))}
                      placeholder="اكتشف"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الزر الثانوي - النص (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.secondary_cta_label_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, secondary_cta_label_ar: e.target.value }))}
                      placeholder="معرفة المزيد"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Preview Section */}
            {previewMode && (
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden border shadow-lg">
                {formData.image_url ? (
                  <img 
                    src={formData.image_url} 
                    alt="VExpo preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-900 via-indigo-900 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
                  <Badge className="mb-4 bg-amber-600">Aperçu Section VExpo 360°</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    {formData.title_fr || "Exposition Virtuelle"}
                  </h2>
                  <p className="text-lg opacity-90 mb-6">
                    {formData.subtitle_fr || "Sous-titre"}
                  </p>
                  <div className="flex gap-4">
                    {formData.cta_label_fr && (
                      <Button className="bg-amber-600 hover:bg-amber-700">
                        {formData.cta_label_fr}
                      </Button>
                    )}
                    {formData.secondary_cta_label_fr && (
                      <Button variant="outline" className="border-white text-white hover:bg-white/20">
                        {formData.secondary_cta_label_fr}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="submit" disabled={saveMutation.isPending} className="gap-2 bg-amber-600 hover:bg-amber-700">
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
