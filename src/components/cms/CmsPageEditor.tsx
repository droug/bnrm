import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import CmsSectionBuilder from "./CmsSectionBuilder";
import CmsWorkflowPanel from "./CmsWorkflowPanel";

interface CmsPageEditorProps {
  page: any | null;
  onClose: () => void;
}

export default function CmsPageEditor({ page, onClose }: CmsPageEditorProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      slug: page?.slug || '',
      title_fr: page?.title_fr || '',
      title_ar: page?.title_ar || '',
      seo_title_fr: page?.seo_title_fr || '',
      seo_title_ar: page?.seo_title_ar || '',
      seo_description_fr: page?.seo_description_fr || '',
      seo_description_ar: page?.seo_description_ar || '',
      seo_canonical: page?.seo_canonical || '',
      status: page?.status || 'draft'
    }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (page?.id) {
      loadSections();
    }
  }, [page?.id]);

  const loadSections = async () => {
    if (!page?.id) return;

    const { data, error } = await supabase
      .from('cms_sections')
      .select('*')
      .eq('page_id', page.id)
      .order('order_index', { ascending: true });

    if (error) {
      toast.error("Erreur lors du chargement des sections");
      return;
    }

    setSections(data || []);
  };

  const onSubmit = async (formData: any) => {
    setIsSaving(true);
    try {
      // Sauvegarder la page
      let pageId = page?.id;

      if (pageId) {
        const { error } = await supabase
          .from('cms_pages')
          .update(formData)
          .eq('id', pageId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('cms_pages')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        pageId = data.id;
      }

      // Sauvegarder les sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionData = {
          ...section,
          page_id: pageId,
          order_index: i
        };

        if (section.id) {
          await supabase
            .from('cms_sections')
            .update(sectionData)
            .eq('id', section.id);
        } else {
          await supabase
            .from('cms_sections')
            .insert([sectionData]);
        }
      }

      toast.success("Page sauvegardée avec succès");
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </Button>
          <Button type="submit" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Éditeur principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="mon-slug-de-page"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Utilisé pour l'URL : /pages/{watch('slug')}
                </p>
              </div>

              <Tabs defaultValue="fr">
                <TabsList>
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="ar">🇲🇦 العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="fr" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_fr">Titre (FR)</Label>
                    <Input
                      id="title_fr"
                      {...register('title_fr')}
                      placeholder="Titre de la page"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_title_fr">SEO Titre (FR)</Label>
                    <Input
                      id="seo_title_fr"
                      {...register('seo_title_fr')}
                      placeholder="Titre optimisé pour le référencement"
                      maxLength={60}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 60 caractères | Actuel : {watch('seo_title_fr')?.length || 0}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_description_fr">SEO Description (FR)</Label>
                    <Textarea
                      id="seo_description_fr"
                      {...register('seo_description_fr')}
                      placeholder="Description optimisée pour le référencement"
                      maxLength={160}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 160 caractères | Actuel : {watch('seo_description_fr')?.length || 0}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_ar">العنوان (AR)</Label>
                    <Input
                      id="title_ar"
                      {...register('title_ar')}
                      placeholder="عنوان الصفحة"
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_title_ar">SEO العنوان (AR)</Label>
                    <Input
                      id="seo_title_ar"
                      {...register('seo_title_ar')}
                      placeholder="عنوان محسّن لمحركات البحث"
                      maxLength={60}
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seo_description_ar">SEO الوصف (AR)</Label>
                    <Textarea
                      id="seo_description_ar"
                      {...register('seo_description_ar')}
                      placeholder="وصف محسّن لمحركات البحث"
                      maxLength={160}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Section Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Sections de la page</CardTitle>
            </CardHeader>
            <CardContent>
              <CmsSectionBuilder
                sections={sections}
                onChange={setSections}
              />
            </CardContent>
          </Card>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Statut et workflow */}
          <CmsWorkflowPanel
            entityType="page"
            entityId={page?.id}
            currentStatus={currentStatus}
            workflowComments={page?.workflow_comments || []}
            onStatusChange={(newStatus) => setValue('status', newStatus)}
          />

          {/* SEO Avancé */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Avancé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_canonical">URL Canonical</Label>
                <Input
                  id="seo_canonical"
                  {...register('seo_canonical')}
                  placeholder="https://exemple.com/page"
                  type="url"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
