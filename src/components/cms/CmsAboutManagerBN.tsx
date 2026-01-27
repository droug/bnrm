import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { Save, Plus, Trash2, GripVertical, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AboutSection {
  id: string;
  title_fr: string;
  title_ar?: string;
  content_fr: string;
  content_ar?: string;
  icon: string;
  order: number;
}

interface AboutValue {
  title_fr: string;
  title_ar?: string;
  description_fr: string;
  description_ar?: string;
  icon: string;
}

interface AboutStatistic {
  label_fr: string;
  label_ar?: string;
  value: string;
  icon: string;
}

interface AboutSettings {
  hero_title_fr: string;
  hero_title_ar?: string;
  hero_subtitle_fr: string;
  hero_subtitle_ar?: string;
  hero_image_url?: string;
  mission_title_fr: string;
  mission_title_ar?: string;
  mission_content_fr: string;
  mission_content_ar?: string;
  vision_title_fr: string;
  vision_title_ar?: string;
  vision_content_fr: string;
  vision_content_ar?: string;
  values: AboutValue[];
  sections: AboutSection[];
  statistics: AboutStatistic[];
  team_title_fr?: string;
  team_title_ar?: string;
  team_description_fr?: string;
  team_description_ar?: string;
}

const defaultSettings: AboutSettings = {
  hero_title_fr: "À propos de la Bibliothèque Numérique Marocaine",
  hero_title_ar: "حول المكتبة الرقمية المغربية",
  hero_subtitle_fr: "Préserver, numériser et partager le patrimoine documentaire du Maroc",
  hero_subtitle_ar: "الحفاظ على التراث الوثائقي المغربي ورقمنته ومشاركته",
  hero_image_url: "",
  mission_title_fr: "Notre Mission",
  mission_title_ar: "مهمتنا",
  mission_content_fr: "La Bibliothèque Numérique Marocaine Ibn Battuta a pour mission de préserver, numériser et rendre accessible le riche patrimoine documentaire du Royaume du Maroc.",
  mission_content_ar: "تتمثل مهمة المكتبة الرقمية المغربية ابن بطوطة في الحفاظ على التراث الوثائقي الغني للمملكة المغربية ورقمنته وإتاحته للجميع.",
  vision_title_fr: "Notre Vision",
  vision_title_ar: "رؤيتنا",
  vision_content_fr: "Devenir la référence incontournable pour l'accès au patrimoine documentaire marocain.",
  vision_content_ar: "أن نصبح المرجع الأساسي للوصول إلى التراث الوثائقي المغربي.",
  values: [
    { title_fr: "Excellence", title_ar: "التميز", description_fr: "Nous visons l'excellence dans la numérisation et la préservation", description_ar: "نسعى للتميز في الرقمنة والحفظ", icon: "mdi:star-outline" },
    { title_fr: "Accessibilité", title_ar: "إمكانية الوصول", description_fr: "Rendre le savoir accessible à tous", description_ar: "جعل المعرفة في متناول الجميع", icon: "mdi:access-point" },
    { title_fr: "Innovation", title_ar: "الابتكار", description_fr: "Utiliser les technologies avancées", description_ar: "استخدام التقنيات المتقدمة", icon: "mdi:lightbulb-outline" },
    { title_fr: "Collaboration", title_ar: "التعاون", description_fr: "Partenariats nationaux et internationaux", description_ar: "شراكات وطنية ودولية", icon: "mdi:handshake-outline" },
  ],
  sections: [
    { id: "1", title_fr: "Nos Collections", title_ar: "مجموعاتنا", content_fr: "Notre bibliothèque abrite plus de 50 000 documents numérisés.", content_ar: "تضم مكتبتنا أكثر من 50,000 وثيقة رقمية", icon: "mdi:book-open-variant", order: 1 },
  ],
  statistics: [
    { label_fr: "Documents numérisés", label_ar: "وثائق رقمية", value: "50,000+", icon: "mdi:file-document-outline" },
    { label_fr: "Manuscrits anciens", label_ar: "مخطوطات قديمة", value: "12,000+", icon: "mdi:scroll-text-outline" },
    { label_fr: "Visiteurs par an", label_ar: "زائر سنويا", value: "500,000+", icon: "mdi:account-multiple-outline" },
    { label_fr: "Années de patrimoine", label_ar: "سنة من التراث", value: "1,200+", icon: "mdi:history" },
  ],
  team_title_fr: "Notre Équipe",
  team_title_ar: "فريقنا",
  team_description_fr: "Une équipe de professionnels passionnés.",
  team_description_ar: "فريق من المحترفين المتحمسين",
};

const iconSuggestions = [
  "mdi:star-outline", "mdi:target", "mdi:eye-outline", "mdi:lightbulb-outline",
  "mdi:handshake-outline", "mdi:book-open-variant", "mdi:scroll-text-outline",
  "mdi:file-document-outline", "mdi:account-group-outline", "mdi:cog-outline",
  "mdi:access-point", "mdi:history", "mdi:earth", "mdi:library",
  "mdi:school-outline", "mdi:certificate-outline", "mdi:medal-outline"
];

export default function CmsAboutManagerBN() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bn-about-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('setting_value')
        .eq('setting_key', 'bn_about_page')
        .maybeSingle();

      if (error) throw error;
      return data ? { ...defaultSettings, ...(data.setting_value as object) } as AboutSettings : defaultSettings;
    },
  });

  const [formData, setFormData] = useState<AboutSettings>(settings || defaultSettings);

  // Update formData when settings load
  useState(() => {
    if (settings) {
      setFormData(settings);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AboutSettings) => {
      // First check if the setting exists
      const { data: existing } = await supabase
        .from('cms_portal_settings')
        .select('id')
        .eq('setting_key', 'bn_about_page')
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(data));

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('cms_portal_settings')
          .update({
            setting_value: jsonValue,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', 'bn_about_page');
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('cms_portal_settings')
          .insert([{
            setting_key: 'bn_about_page',
            setting_value: jsonValue,
            category: 'bn',
            description: 'Page À propos de la Bibliothèque Numérique',
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-about-settings'] });
      queryClient.invalidateQueries({ queryKey: ['bn-about-settings-admin'] });
      toast.success("Page À propos mise à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const updateField = (field: keyof AboutSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    const newSection: AboutSection = {
      id: Date.now().toString(),
      title_fr: "Nouvelle section",
      title_ar: "قسم جديد",
      content_fr: "Contenu de la section...",
      content_ar: "محتوى القسم...",
      icon: "mdi:information-outline",
      order: (formData.sections?.length || 0) + 1,
    };
    updateField('sections', [...(formData.sections || []), newSection]);
  };

  const removeSection = (id: string) => {
    updateField('sections', formData.sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: keyof AboutSection, value: any) => {
    updateField('sections', formData.sections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const addValue = () => {
    const newValue: AboutValue = {
      title_fr: "Nouvelle valeur",
      title_ar: "قيمة جديدة",
      description_fr: "Description...",
      description_ar: "الوصف...",
      icon: "mdi:star-outline",
    };
    updateField('values', [...(formData.values || []), newValue]);
  };

  const removeValue = (index: number) => {
    updateField('values', formData.values.filter((_, i) => i !== index));
  };

  const updateValue = (index: number, field: keyof AboutValue, value: string) => {
    updateField('values', formData.values.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const updateStatistic = (index: number, field: keyof AboutStatistic, value: string) => {
    updateField('statistics', formData.statistics.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Page À propos</h2>
          <p className="text-muted-foreground">Gérer le contenu de la page À propos de la Bibliothèque Numérique</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <a href="/digital-library/about" target="_blank" className="gap-2">
              <Eye className="h-4 w-4" />
              Prévisualiser
            </a>
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="hero" className="gap-2">
            <Icon name="mdi:home-outline" className="h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="mission" className="gap-2">
            <Icon name="mdi:target" className="h-4 w-4" />
            Mission
          </TabsTrigger>
          <TabsTrigger value="values" className="gap-2">
            <Icon name="mdi:star-outline" className="h-4 w-4" />
            Valeurs
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <Icon name="mdi:view-list-outline" className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Icon name="mdi:chart-bar" className="h-4 w-4" />
            Statistiques
          </TabsTrigger>
        </TabsList>

        {/* Hero Tab */}
        <TabsContent value="hero" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Hero</CardTitle>
              <CardDescription>Titre principal et introduction de la page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Titre (Français)</Label>
                  <Input
                    value={formData.hero_title_fr}
                    onChange={(e) => updateField('hero_title_fr', e.target.value)}
                    placeholder="Titre principal..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre (Arabe)</Label>
                  <Input
                    dir="rtl"
                    value={formData.hero_title_ar || ''}
                    onChange={(e) => updateField('hero_title_ar', e.target.value)}
                    placeholder="العنوان الرئيسي..."
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Sous-titre (Français)</Label>
                  <Textarea
                    value={formData.hero_subtitle_fr}
                    onChange={(e) => updateField('hero_subtitle_fr', e.target.value)}
                    placeholder="Description courte..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sous-titre (Arabe)</Label>
                  <Textarea
                    dir="rtl"
                    value={formData.hero_subtitle_ar || ''}
                    onChange={(e) => updateField('hero_subtitle_ar', e.target.value)}
                    placeholder="الوصف القصير..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Tab */}
        <TabsContent value="mission" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notre Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Titre (Français)</Label>
                  <Input
                    value={formData.mission_title_fr}
                    onChange={(e) => updateField('mission_title_fr', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre (Arabe)</Label>
                  <Input
                    dir="rtl"
                    value={formData.mission_title_ar || ''}
                    onChange={(e) => updateField('mission_title_ar', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Contenu (Français)</Label>
                  <Textarea
                    value={formData.mission_content_fr}
                    onChange={(e) => updateField('mission_content_fr', e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenu (Arabe)</Label>
                  <Textarea
                    dir="rtl"
                    value={formData.mission_content_ar || ''}
                    onChange={(e) => updateField('mission_content_ar', e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notre Vision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Titre (Français)</Label>
                  <Input
                    value={formData.vision_title_fr}
                    onChange={(e) => updateField('vision_title_fr', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre (Arabe)</Label>
                  <Input
                    dir="rtl"
                    value={formData.vision_title_ar || ''}
                    onChange={(e) => updateField('vision_title_ar', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Contenu (Français)</Label>
                  <Textarea
                    value={formData.vision_content_fr}
                    onChange={(e) => updateField('vision_content_fr', e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenu (Arabe)</Label>
                  <Textarea
                    dir="rtl"
                    value={formData.vision_content_ar || ''}
                    onChange={(e) => updateField('vision_content_ar', e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nos Valeurs</CardTitle>
                <CardDescription>Les principes fondamentaux de la bibliothèque</CardDescription>
              </div>
              <Button onClick={addValue} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {formData.values.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon name={value.icon} className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{value.title_fr}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeValue(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={value.title_fr}
                          onChange={(e) => updateValue(index, 'title_fr', e.target.value)}
                          placeholder="Titre (Français)"
                        />
                        <Input
                          dir="rtl"
                          value={value.title_ar || ''}
                          onChange={(e) => updateValue(index, 'title_ar', e.target.value)}
                          placeholder="العنوان (عربي)"
                        />
                        <Textarea
                          value={value.description_fr}
                          onChange={(e) => updateValue(index, 'description_fr', e.target.value)}
                          placeholder="Description (Français)"
                          rows={2}
                        />
                        <Textarea
                          dir="rtl"
                          value={value.description_ar || ''}
                          onChange={(e) => updateValue(index, 'description_ar', e.target.value)}
                          placeholder="الوصف (عربي)"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icône MDI</Label>
                        <div className="flex flex-wrap gap-2">
                          {iconSuggestions.map((icon) => (
                            <button
                              key={icon}
                              onClick={() => updateValue(index, 'icon', icon)}
                              className={cn(
                                "p-2 rounded-lg border transition-colors",
                                value.icon === icon
                                  ? "border-primary bg-primary/10"
                                  : "hover:border-primary/50"
                              )}
                            >
                              <Icon name={icon} className="h-5 w-5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sections de contenu</CardTitle>
                <CardDescription>Blocs de contenu additionnels (Collections, Technologies, Partenariats...)</CardDescription>
              </div>
              <Button onClick={addSection} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une section
              </Button>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                  {formData.sections.map((section) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <div className="p-2 rounded-lg bg-gold-bn-primary/10">
                            <Icon name={section.icon} className="h-5 w-5 text-gold-bn-primary" />
                          </div>
                          <span className="font-medium">{section.title_fr}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          value={section.title_fr}
                          onChange={(e) => updateSection(section.id, 'title_fr', e.target.value)}
                          placeholder="Titre (Français)"
                        />
                        <Input
                          dir="rtl"
                          value={section.title_ar || ''}
                          onChange={(e) => updateSection(section.id, 'title_ar', e.target.value)}
                          placeholder="العنوان (عربي)"
                        />
                        <Textarea
                          value={section.content_fr}
                          onChange={(e) => updateSection(section.id, 'content_fr', e.target.value)}
                          placeholder="Contenu (Français)"
                          rows={4}
                        />
                        <Textarea
                          dir="rtl"
                          value={section.content_ar || ''}
                          onChange={(e) => updateSection(section.id, 'content_ar', e.target.value)}
                          placeholder="المحتوى (عربي)"
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icône MDI</Label>
                        <div className="flex flex-wrap gap-2">
                          {iconSuggestions.map((icon) => (
                            <button
                              key={icon}
                              onClick={() => updateSection(section.id, 'icon', icon)}
                              className={cn(
                                "p-2 rounded-lg border transition-colors",
                                section.icon === icon
                                  ? "border-gold-bn-primary bg-gold-bn-primary/10"
                                  : "hover:border-gold-bn-primary/50"
                              )}
                            >
                              <Icon name={icon} className="h-5 w-5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Chiffres clés affichés sur la page À propos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {formData.statistics.map((stat, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bn-blue/10">
                        <Icon name={stat.icon} className="h-5 w-5 text-bn-blue" />
                      </div>
                      <span className="font-bold text-2xl">{stat.value}</span>
                    </div>
                    <div className="grid gap-3">
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStatistic(index, 'value', e.target.value)}
                        placeholder="Valeur (ex: 50,000+)"
                      />
                      <Input
                        value={stat.label_fr}
                        onChange={(e) => updateStatistic(index, 'label_fr', e.target.value)}
                        placeholder="Label (Français)"
                      />
                      <Input
                        dir="rtl"
                        value={stat.label_ar || ''}
                        onChange={(e) => updateStatistic(index, 'label_ar', e.target.value)}
                        placeholder="التسمية (عربي)"
                      />
                      <div className="space-y-2">
                        <Label className="text-xs">Icône</Label>
                        <div className="flex flex-wrap gap-1">
                          {iconSuggestions.slice(0, 8).map((icon) => (
                            <button
                              key={icon}
                              onClick={() => updateStatistic(index, 'icon', icon)}
                              className={cn(
                                "p-1.5 rounded border transition-colors",
                                stat.icon === icon
                                  ? "border-bn-blue bg-bn-blue/10"
                                  : "hover:border-bn-blue/50"
                              )}
                            >
                              <Icon name={icon} className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
