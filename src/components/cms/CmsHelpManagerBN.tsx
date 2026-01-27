import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, Save, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQCategory {
  id: string;
  title_fr: string;
  title_ar?: string;
  icon: string;
  order: number;
  questions: FAQQuestion[];
}

interface FAQQuestion {
  id: string;
  question_fr: string;
  question_ar?: string;
  answer_fr: string;
  answer_ar?: string;
}

interface HelpSettings {
  hero_title_fr: string;
  hero_title_ar?: string;
  hero_subtitle_fr: string;
  hero_subtitle_ar?: string;
  search_placeholder_fr: string;
  search_placeholder_ar?: string;
  categories: FAQCategory[];
  contact: {
    email: string;
    phone: string;
    phone_hours_fr: string;
    phone_hours_ar?: string;
    address_fr: string;
    address_ar?: string;
    cta_label_fr: string;
    cta_label_ar?: string;
  };
  quick_links: Array<{
    label_fr: string;
    label_ar?: string;
    url: string;
    icon: string;
  }>;
}

const defaultSettings: HelpSettings = {
  hero_title_fr: "Aide & FAQ",
  hero_title_ar: "المساعدة والأسئلة الشائعة",
  hero_subtitle_fr: "Trouvez rapidement des réponses à vos questions",
  hero_subtitle_ar: "اعثر على إجابات لأسئلتك بسرعة",
  search_placeholder_fr: "Rechercher dans la FAQ...",
  search_placeholder_ar: "البحث في الأسئلة الشائعة...",
  categories: [
    {
      id: "1",
      title_fr: "Comment consulter",
      title_ar: "كيفية الاستشارة",
      icon: "mdi:book-open-variant",
      order: 1,
      questions: [
        {
          id: "1-1",
          question_fr: "Comment accéder aux documents numériques ?",
          question_ar: "كيف يمكنني الوصول إلى الوثائق الرقمية؟",
          answer_fr: "Pour consulter les documents, utilisez la barre de recherche ou parcourez nos collections par thème. Certains documents nécessitent une inscription gratuite.",
          answer_ar: "للاطلاع على الوثائق، استخدم شريط البحث أو تصفح مجموعاتنا حسب الموضوع."
        }
      ]
    },
    {
      id: "2",
      title_fr: "Droits d'auteur",
      title_ar: "حقوق المؤلف",
      icon: "mdi:copyright",
      order: 2,
      questions: [
        {
          id: "2-1",
          question_fr: "Quels documents puis-je télécharger ?",
          question_ar: "ما هي الوثائق التي يمكنني تحميلها؟",
          answer_fr: "Les documents du domaine public ou sous licence libre sont téléchargeables. Les documents protégés nécessitent une autorisation spécifique.",
          answer_ar: "يمكن تحميل وثائق الملكية العامة أو تلك ذات الترخيص الحر."
        }
      ]
    },
    {
      id: "3",
      title_fr: "Formats",
      title_ar: "الصيغ",
      icon: "mdi:file-document-outline",
      order: 3,
      questions: [
        {
          id: "3-1",
          question_fr: "Quels formats de fichiers sont disponibles ?",
          question_ar: "ما هي صيغ الملفات المتاحة؟",
          answer_fr: "Nos documents sont disponibles en PDF, EPUB pour les livres, et JPEG/TIFF pour les images.",
          answer_ar: "وثائقنا متاحة بصيغ PDF و EPUB للكتب و JPEG/TIFF للصور."
        }
      ]
    },
    {
      id: "4",
      title_fr: "Téléchargement",
      title_ar: "التحميل",
      icon: "mdi:download",
      order: 4,
      questions: [
        {
          id: "4-1",
          question_fr: "Y a-t-il une limite de téléchargement ?",
          question_ar: "هل هناك حد للتحميل؟",
          answer_fr: "Les utilisateurs gratuits peuvent télécharger jusqu'à 10 documents par mois. Les abonnés premium n'ont pas de limite.",
          answer_ar: "يمكن للمستخدمين المجانيين تحميل ما يصل إلى 10 وثائق شهريًا."
        }
      ]
    }
  ],
  contact: {
    email: "support@bnrm.ma",
    phone: "+212 537 27 16 33",
    phone_hours_fr: "Du lundi au vendredi, 9h-17h",
    phone_hours_ar: "من الاثنين إلى الجمعة، 9 صباحًا - 5 مساءً",
    address_fr: "Bibliothèque Nationale du Royaume du Maroc\nAvenue Ibn Batouta, Rabat, Maroc",
    address_ar: "المكتبة الوطنية للمملكة المغربية\nشارع ابن بطوطة، الرباط، المغرب",
    cta_label_fr: "Nous contacter",
    cta_label_ar: "اتصل بنا"
  },
  quick_links: [
    { label_fr: "Guide d'utilisation", label_ar: "دليل الاستخدام", url: "/digital-library/guide", icon: "mdi:book-open-page-variant" },
    { label_fr: "Tutoriels vidéo", label_ar: "دروس فيديو", url: "/digital-library/tutorials", icon: "mdi:video-outline" },
    { label_fr: "Demande de reproduction", label_ar: "طلب استنساخ", url: "/digital-library/reproduction", icon: "mdi:content-copy" }
  ]
};

export default function CmsHelpManagerBN() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<HelpSettings>(defaultSettings);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['bn-help-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_portal_settings')
        .select('setting_value')
        .eq('setting_key', 'bn_help_page')
        .maybeSingle();

      if (error) throw error;
      
      if (data?.setting_value) {
        const merged = { ...defaultSettings, ...(data.setting_value as object) } as HelpSettings;
        setSettings(merged);
        return merged;
      }
      
      setSettings(defaultSettings);
      return defaultSettings;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: HelpSettings) => {
      const { error } = await supabase
        .from('cms_portal_settings')
        .upsert({
          setting_key: 'bn_help_page',
          setting_value: newSettings as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bn-help-settings'] });
      toast.success("Paramètres de la page Aide sauvegardés");
      setIsDirty(false);
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    }
  });

  const updateSettings = (updates: Partial<HelpSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const updateContact = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact: { ...prev.contact, [key]: value }
    }));
    setIsDirty(true);
  };

  const addCategory = () => {
    const newCategory: FAQCategory = {
      id: Date.now().toString(),
      title_fr: "Nouvelle catégorie",
      title_ar: "",
      icon: "mdi:help-circle-outline",
      order: settings.categories.length + 1,
      questions: []
    };
    updateSettings({ categories: [...settings.categories, newCategory] });
  };

  const updateCategory = (id: string, updates: Partial<FAQCategory>) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === id ? { ...cat, ...updates } : cat
      )
    }));
    setIsDirty(true);
  };

  const deleteCategory = (id: string) => {
    updateSettings({ 
      categories: settings.categories.filter(cat => cat.id !== id) 
    });
  };

  const addQuestion = (categoryId: string) => {
    const newQuestion: FAQQuestion = {
      id: Date.now().toString(),
      question_fr: "Nouvelle question",
      question_ar: "",
      answer_fr: "Réponse à ajouter...",
      answer_ar: ""
    };
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, questions: [...cat.questions, newQuestion] }
          : cat
      )
    }));
    setIsDirty(true);
  };

  const updateQuestion = (categoryId: string, questionId: string, updates: Partial<FAQQuestion>) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? {
              ...cat,
              questions: cat.questions.map(q => 
                q.id === questionId ? { ...q, ...updates } : q
              )
            }
          : cat
      )
    }));
    setIsDirty(true);
  };

  const deleteQuestion = (categoryId: string, questionId: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, questions: cat.questions.filter(q => q.id !== questionId) }
          : cat
      )
    }));
    setIsDirty(true);
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
      {/* Header avec bouton sauvegarder */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Aide & FAQ</h2>
          <p className="text-muted-foreground">
            Configurez le contenu de la page d'aide de la Bibliothèque Numérique
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/digital-library/help', '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button 
            onClick={() => saveMutation.mutate(settings)}
            disabled={!isDirty || saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="links">Liens rapides</TabsTrigger>
        </TabsList>

        {/* Général */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="mdi:format-title" className="h-5 w-5" />
                Section Hero
              </CardTitle>
              <CardDescription>Titre et sous-titre de la page</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Titre (Français)</Label>
                  <Input
                    value={settings.hero_title_fr}
                    onChange={(e) => updateSettings({ hero_title_fr: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sous-titre (Français)</Label>
                  <Textarea
                    value={settings.hero_subtitle_fr}
                    onChange={(e) => updateSettings({ hero_subtitle_fr: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Placeholder recherche (Français)</Label>
                  <Input
                    value={settings.search_placeholder_fr}
                    onChange={(e) => updateSettings({ search_placeholder_fr: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label>Titre (Arabe)</Label>
                  <Input
                    value={settings.hero_title_ar || ''}
                    onChange={(e) => updateSettings({ hero_title_ar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sous-titre (Arabe)</Label>
                  <Textarea
                    value={settings.hero_subtitle_ar || ''}
                    onChange={(e) => updateSettings({ hero_subtitle_ar: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Placeholder recherche (Arabe)</Label>
                  <Input
                    value={settings.search_placeholder_ar || ''}
                    onChange={(e) => updateSettings({ search_placeholder_ar: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Categories */}
        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catégories FAQ</h3>
            <Button onClick={addCategory} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une catégorie
            </Button>
          </div>

          <div className="space-y-4">
            {settings.categories.map((category) => (
              <Card key={category.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon name={category.icon} className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <Input
                          value={category.title_fr}
                          onChange={(e) => updateCategory(category.id, { title_fr: e.target.value })}
                          placeholder="Titre FR"
                        />
                        <Input
                          value={category.title_ar || ''}
                          onChange={(e) => updateCategory(category.id, { title_ar: e.target.value })}
                          placeholder="Titre AR"
                          dir="rtl"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Input
                        value={category.icon}
                        onChange={(e) => updateCategory(category.id, { icon: e.target.value })}
                        placeholder="mdi:icon-name"
                        className="w-40 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {category.questions.map((question, qIndex) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-muted/50 rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs text-muted-foreground font-medium">
                            Question {qIndex + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => deleteQuestion(category.id, question.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Input
                              value={question.question_fr}
                              onChange={(e) => updateQuestion(category.id, question.id, { question_fr: e.target.value })}
                              placeholder="Question (FR)"
                            />
                            <Textarea
                              value={question.answer_fr}
                              onChange={(e) => updateQuestion(category.id, question.id, { answer_fr: e.target.value })}
                              placeholder="Réponse (FR)"
                              rows={2}
                            />
                          </div>
                          <div className="space-y-2" dir="rtl">
                            <Input
                              value={question.question_ar || ''}
                              onChange={(e) => updateQuestion(category.id, question.id, { question_ar: e.target.value })}
                              placeholder="Question (AR)"
                            />
                            <Textarea
                              value={question.answer_ar || ''}
                              onChange={(e) => updateQuestion(category.id, question.id, { answer_ar: e.target.value })}
                              placeholder="Réponse (AR)"
                              rows={2}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addQuestion(category.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une question
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Contact */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="mdi:phone-outline" className="h-5 w-5" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={settings.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Horaires (Français)</Label>
                  <Input
                    value={settings.contact.phone_hours_fr}
                    onChange={(e) => updateContact('phone_hours_fr', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Adresse (Français)</Label>
                  <Textarea
                    value={settings.contact.address_fr}
                    onChange={(e) => updateContact('address_fr', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Libellé bouton CTA (Français)</Label>
                  <Input
                    value={settings.contact.cta_label_fr}
                    onChange={(e) => updateContact('cta_label_fr', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4" dir="rtl">
                <div>
                  <Label>Horaires (Arabe)</Label>
                  <Input
                    value={settings.contact.phone_hours_ar || ''}
                    onChange={(e) => updateContact('phone_hours_ar', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Adresse (Arabe)</Label>
                  <Textarea
                    value={settings.contact.address_ar || ''}
                    onChange={(e) => updateContact('address_ar', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Libellé bouton CTA (Arabe)</Label>
                  <Input
                    value={settings.contact.cta_label_ar || ''}
                    onChange={(e) => updateContact('cta_label_ar', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quick Links */}
        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="mdi:link-variant" className="h-5 w-5" />
                Liens rapides
              </CardTitle>
              <CardDescription>Liens utiles affichés sur la page d'aide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.quick_links.map((link, index) => (
                <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                  <Input
                    value={link.icon}
                    onChange={(e) => {
                      const newLinks = [...settings.quick_links];
                      newLinks[index].icon = e.target.value;
                      updateSettings({ quick_links: newLinks });
                    }}
                    placeholder="mdi:icon"
                    className="w-32"
                  />
                  <Input
                    value={link.label_fr}
                    onChange={(e) => {
                      const newLinks = [...settings.quick_links];
                      newLinks[index].label_fr = e.target.value;
                      updateSettings({ quick_links: newLinks });
                    }}
                    placeholder="Libellé FR"
                    className="flex-1"
                  />
                  <Input
                    value={link.label_ar || ''}
                    onChange={(e) => {
                      const newLinks = [...settings.quick_links];
                      newLinks[index].label_ar = e.target.value;
                      updateSettings({ quick_links: newLinks });
                    }}
                    placeholder="Libellé AR"
                    className="flex-1"
                    dir="rtl"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...settings.quick_links];
                      newLinks[index].url = e.target.value;
                      updateSettings({ quick_links: newLinks });
                    }}
                    placeholder="/url"
                    className="w-48"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      updateSettings({
                        quick_links: settings.quick_links.filter((_, i) => i !== index)
                      });
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => {
                  updateSettings({
                    quick_links: [
                      ...settings.quick_links,
                      { label_fr: "Nouveau lien", label_ar: "", url: "/", icon: "mdi:link" }
                    ]
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un lien
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
