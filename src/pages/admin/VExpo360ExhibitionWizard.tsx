import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Eye, Image, Settings, FileText, Globe } from "lucide-react";
import { VExpoImageUpload } from "@/components/vexpo360/VExpoImageUpload";

interface ExhibitionFormData {
  title_fr: string;
  title_ar: string;
  teaser_fr: string;
  teaser_ar: string;
  intro_fr: string;
  intro_ar: string;
  cover_image_url: string;
  cta_title_fr: string;
  cta_title_ar: string;
  opening_hours_fr: string;
  opening_hours_ar: string;
  location_text_fr: string;
  location_text_ar: string;
  map_link: string;
  primary_button_label_fr: string;
  primary_button_label_ar: string;
  meta_title_fr: string;
  meta_description_fr: string;
  meta_title_ar: string;
  meta_description_ar: string;
  start_date: string;
  end_date: string;
}

const defaultFormData: ExhibitionFormData = {
  title_fr: "",
  title_ar: "",
  teaser_fr: "",
  teaser_ar: "",
  intro_fr: "",
  intro_ar: "",
  cover_image_url: "",
  cta_title_fr: "",
  cta_title_ar: "",
  opening_hours_fr: "",
  opening_hours_ar: "",
  location_text_fr: "",
  location_text_ar: "",
  map_link: "",
  primary_button_label_fr: "Commencer la visite",
  primary_button_label_ar: "ابدأ الجولة",
  meta_title_fr: "",
  meta_description_fr: "",
  meta_title_ar: "",
  meta_description_ar: "",
  start_date: "",
  end_date: "",
};

export default function VExpo360ExhibitionWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<ExhibitionFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("content");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Fetch exhibition if editing
  const { data: exhibition, isLoading } = useQuery({
    queryKey: ['vexpo360-exhibition', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('vexpo_exhibitions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
    staleTime: Infinity, // Prevent automatic refetches while editing
  });

  // Populate form ONLY on initial load (not on refetch)
  useEffect(() => {
    if (exhibition && !formInitialized) {
      setFormData({
        title_fr: exhibition.title_fr || "",
        title_ar: exhibition.title_ar || "",
        teaser_fr: exhibition.teaser_fr || "",
        teaser_ar: exhibition.teaser_ar || "",
        intro_fr: exhibition.intro_fr || "",
        intro_ar: exhibition.intro_ar || "",
        cover_image_url: exhibition.cover_image_url || "",
        cta_title_fr: exhibition.cta_title_fr || "",
        cta_title_ar: exhibition.cta_title_ar || "",
        opening_hours_fr: exhibition.opening_hours_fr || "",
        opening_hours_ar: exhibition.opening_hours_ar || "",
        location_text_fr: exhibition.location_text_fr || "",
        location_text_ar: exhibition.location_text_ar || "",
        map_link: exhibition.map_link || "",
        primary_button_label_fr: exhibition.primary_button_label_fr || "Commencer la visite",
        primary_button_label_ar: exhibition.primary_button_label_ar || "ابدأ الجولة",
        meta_title_fr: exhibition.meta_title_fr || "",
        meta_description_fr: exhibition.meta_description_fr || "",
        meta_title_ar: exhibition.meta_title_ar || "",
        meta_description_ar: exhibition.meta_description_ar || "",
        start_date: exhibition.start_date?.split('T')[0] || "",
        end_date: exhibition.end_date?.split('T')[0] || "",
      });
      setFormInitialized(true);
    }
  }, [exhibition, formInitialized]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: ExhibitionFormData) => {
      const payload = {
        ...data,
        start_date: data.start_date || null,
        end_date: data.end_date || null,
        created_by: user?.id,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('vexpo_exhibitions')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
        return id;
      } else {
        const { data: newExhibition, error } = await supabase
          .from('vexpo_exhibitions')
          .insert([{ ...payload, slug: '', status: 'draft' as const }])
          .select('id')
          .single();
        if (error) throw error;
        return newExhibition.id;
      }
    },
    onSuccess: (exhibitionId) => {
      // Admin lists
      queryClient.invalidateQueries({ queryKey: ['vexpo360-exhibitions'] });
      // Current editor view
      queryClient.invalidateQueries({ queryKey: ['vexpo360-exhibition', exhibitionId] });
      // Front-office caches
      queryClient.invalidateQueries({ queryKey: ['vexpo360-public-exhibitions'] });
      queryClient.invalidateQueries({ queryKey: ['vexpo360-public-exhibition'] });
      queryClient.invalidateQueries({ queryKey: ['latest-vexpo-exhibition'] });

      toast({ title: isEditing ? "Exposition mise à jour" : "Exposition créée" });
      if (!isEditing) {
        navigate(`/admin/vexpo360/edit/${exhibitionId}`);
      }
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder l'exposition", variant: "destructive" });
    }
  });

  const handleChange = (field: keyof ExhibitionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isCoverUploading) {
      toast({
        title: "Téléversement en cours",
        description: "Veuillez attendre la fin du téléversement avant d'enregistrer.",
        variant: "destructive",
      });
      return;
    }
    if (!formData.title_fr.trim()) {
      toast({ title: "Erreur", description: "Le titre français est obligatoire", variant: "destructive" });
      return;
    }
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <span className="font-semibold">CMS VExpo 360°</span>
        </div>
      </header>
      
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/vexpo360")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? "Modifier l'exposition" : "Nouvelle exposition 360°"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? exhibition?.slug : "Créez une nouvelle exposition virtuelle immersive"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => navigate(`/admin/vexpo360/panoramas/${id}`)}>
                  <Image className="h-4 w-4 mr-2" />
                  Panoramas & Hotspots
                </Button>
                <Button variant="outline" onClick={() => window.open(`/digital-library/exposition-virtuelle/${exhibition?.slug}`, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Prévisualiser
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                <Image className="h-4 w-4" />
                <span>Enregistrez d'abord pour gérer les panoramas</span>
              </div>
            )}
            <Button onClick={handleSave} disabled={saveMutation.isPending || isCoverUploading}>
              <Save className="h-4 w-4 mr-2" />
              {isCoverUploading
                ? "Téléversement…"
                : saveMutation.isPending
                  ? "Enregistrement..."
                  : "Enregistrer"}
            </Button>
          </div>
        </div>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="content">
              <FileText className="h-4 w-4 mr-2" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="visual">
              <Image className="h-4 w-4 mr-2" />
              Visuels
            </TabsTrigger>
            <TabsTrigger value="info">
              <Settings className="h-4 w-4 mr-2" />
              Infos pratiques
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Globe className="h-4 w-4 mr-2" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Français</CardTitle>
                  <CardDescription>Contenu en français</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title_fr">Titre *</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => handleChange('title_fr', e.target.value)}
                      placeholder="Titre de l'exposition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teaser_fr">Accroche</Label>
                    <Textarea
                      id="teaser_fr"
                      value={formData.teaser_fr}
                      onChange={(e) => handleChange('teaser_fr', e.target.value)}
                      placeholder="Courte description pour la page d'accueil"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="intro_fr">Introduction</Label>
                    <Textarea
                      id="intro_fr"
                      value={formData.intro_fr}
                      onChange={(e) => handleChange('intro_fr', e.target.value)}
                      placeholder="Texte d'introduction détaillé"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta_title_fr">Titre du CTA</Label>
                    <Input
                      id="cta_title_fr"
                      value={formData.cta_title_fr}
                      onChange={(e) => handleChange('cta_title_fr', e.target.value)}
                      placeholder="Découvrez l'exposition"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_button_label_fr">Label bouton principal</Label>
                    <Input
                      id="primary_button_label_fr"
                      value={formData.primary_button_label_fr}
                      onChange={(e) => handleChange('primary_button_label_fr', e.target.value)}
                      placeholder="Commencer la visite"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>العربية</CardTitle>
                  <CardDescription>المحتوى بالعربية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4" dir="rtl">
                  <div>
                    <Label htmlFor="title_ar">العنوان</Label>
                    <Input
                      id="title_ar"
                      value={formData.title_ar}
                      onChange={(e) => handleChange('title_ar', e.target.value)}
                      placeholder="عنوان المعرض"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teaser_ar">الملخص</Label>
                    <Textarea
                      id="teaser_ar"
                      value={formData.teaser_ar}
                      onChange={(e) => handleChange('teaser_ar', e.target.value)}
                      placeholder="وصف مختصر للصفحة الرئيسية"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="intro_ar">المقدمة</Label>
                    <Textarea
                      id="intro_ar"
                      value={formData.intro_ar}
                      onChange={(e) => handleChange('intro_ar', e.target.value)}
                      placeholder="نص المقدمة التفصيلي"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cta_title_ar">عنوان الدعوة للإجراء</Label>
                    <Input
                      id="cta_title_ar"
                      value={formData.cta_title_ar}
                      onChange={(e) => handleChange('cta_title_ar', e.target.value)}
                      placeholder="اكتشف المعرض"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_button_label_ar">نص الزر الرئيسي</Label>
                    <Input
                      id="primary_button_label_ar"
                      value={formData.primary_button_label_ar}
                      onChange={(e) => handleChange('primary_button_label_ar', e.target.value)}
                      placeholder="ابدأ الجولة"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visual Tab */}
          <TabsContent value="visual">
            <Card>
              <CardHeader>
                <CardTitle>Image de couverture</CardTitle>
                <CardDescription>Image principale affichée sur la carte de l'exposition (recommandé: 1200x630px)</CardDescription>
              </CardHeader>
              <CardContent>
                <VExpoImageUpload
                  value={formData.cover_image_url}
                  onChange={(url) => handleChange('cover_image_url', url)}
                  onUploadingChange={setIsCoverUploading}
                  label=""
                  folder="covers"
                  maxSizeMB={10}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Practical Info Tab */}
          <TabsContent value="info">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Période d'exposition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Date de début</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleChange('start_date', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Date de fin</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleChange('end_date', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="location_text_fr">Adresse (FR)</Label>
                    <Input
                      id="location_text_fr"
                      value={formData.location_text_fr}
                      onChange={(e) => handleChange('location_text_fr', e.target.value)}
                      placeholder="Bibliothèque Nationale, Rabat"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location_text_ar">العنوان (AR)</Label>
                    <Input
                      id="location_text_ar"
                      value={formData.location_text_ar}
                      onChange={(e) => handleChange('location_text_ar', e.target.value)}
                      placeholder="المكتبة الوطنية، الرباط"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="map_link">Lien Google Maps</Label>
                    <Input
                      id="map_link"
                      type="url"
                      value={formData.map_link}
                      onChange={(e) => handleChange('map_link', e.target.value)}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Horaires d'ouverture</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="opening_hours_fr">Horaires (FR)</Label>
                    <Textarea
                      id="opening_hours_fr"
                      value={formData.opening_hours_fr}
                      onChange={(e) => handleChange('opening_hours_fr', e.target.value)}
                      placeholder="Lundi - Vendredi: 9h - 18h&#10;Samedi: 10h - 16h"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="opening_hours_ar">أوقات العمل (AR)</Label>
                    <Textarea
                      id="opening_hours_ar"
                      value={formData.opening_hours_ar}
                      onChange={(e) => handleChange('opening_hours_ar', e.target.value)}
                      placeholder="الإثنين - الجمعة: 9 - 18&#10;السبت: 10 - 16"
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Français</CardTitle>
                  <CardDescription>Optimisation pour les moteurs de recherche</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title_fr">Meta Title</Label>
                    <Input
                      id="meta_title_fr"
                      value={formData.meta_title_fr}
                      onChange={(e) => handleChange('meta_title_fr', e.target.value)}
                      placeholder="Titre pour les moteurs de recherche"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title_fr.length}/60 caractères
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description_fr">Meta Description</Label>
                    <Textarea
                      id="meta_description_fr"
                      value={formData.meta_description_fr}
                      onChange={(e) => handleChange('meta_description_fr', e.target.value)}
                      placeholder="Description pour les moteurs de recherche"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description_fr.length}/160 caractères
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO العربية</CardTitle>
                  <CardDescription>تحسين محركات البحث</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4" dir="rtl">
                  <div>
                    <Label htmlFor="meta_title_ar">العنوان الوصفي</Label>
                    <Input
                      id="meta_title_ar"
                      value={formData.meta_title_ar}
                      onChange={(e) => handleChange('meta_title_ar', e.target.value)}
                      placeholder="العنوان لمحركات البحث"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title_ar.length}/60 حرف
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="meta_description_ar">الوصف التعريفي</Label>
                    <Textarea
                      id="meta_description_ar"
                      value={formData.meta_description_ar}
                      onChange={(e) => handleChange('meta_description_ar', e.target.value)}
                      placeholder="الوصف لمحركات البحث"
                      rows={3}
                      maxLength={160}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description_ar.length}/160 حرف
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
