import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Loader2, LayoutTemplate, Eye, EyeOff, GripVertical, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";

interface Section {
  id: string;
  page_id: string | null;
  section_type: string;
  title_fr: string | null;
  title_ar: string | null;
  content_fr: string | null;
  content_ar: string | null;
  props: Record<string, any> | null;
  order_index: number;
  is_visible: boolean | null;
  created_at: string | null;
}

interface Page {
  id: string;
  title_fr: string;
  slug: string;
}

const sectionTypes = [
  { value: "hero", label: "Hero Banner" },
  { value: "richtext", label: "Texte enrichi" },
  { value: "grid", label: "Grille" },
  { value: "cardList", label: "Liste de cartes" },
  { value: "cards", label: "Cartes" },
  { value: "carousel", label: "Carrousel" },
  { value: "banner", label: "Bannière" },
  { value: "faq", label: "Accordéon FAQ" },
  { value: "eventList", label: "Liste d'événements" },
  { value: "image", label: "Image" },
  { value: "video", label: "Vidéo" },
  { value: "callout", label: "Appel à l'action" },
  { value: "statBlocks", label: "Blocs statistiques" },
  { value: "stats", label: "Statistiques" },
  { value: "custom", label: "Personnalisé" },
  { value: "timeline", label: "Timeline" },
];

export default function CmsSectionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Section | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("");

  const [formData, setFormData] = useState({
    page_id: "",
    section_type: "text",
    title_fr: "",
    title_ar: "",
    content_fr: "",
    content_ar: "",
    order_index: 0,
    is_visible: true,
  });

  const { data: pages = [] } = useQuery({
    queryKey: ['cms-pages-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('id, title_fr, slug')
        .order('title_fr');
      if (error) throw error;
      return data as Page[];
    }
  });

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['cms-sections', selectedPageId],
    queryFn: async () => {
      let query = supabase
        .from('cms_sections')
        .select('*')
        .order('order_index');
      
      if (selectedPageId) {
        query = query.eq('page_id', selectedPageId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Section[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        page_id: data.page_id || null,
        section_type: data.section_type,
        title_fr: data.title_fr || null,
        title_ar: data.title_ar || null,
        content_fr: data.content_fr || null,
        content_ar: data.content_ar || null,
        order_index: data.order_index,
        is_visible: data.is_visible,
      };

      if (data.id) {
        const { error } = await supabase
          .from('cms_sections')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_sections')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-sections'] });
      toast({ title: editingItem ? "Section mise à jour" : "Section créée" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_sections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-sections'] });
      toast({ title: "Section supprimée" });
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('cms_sections')
        .update({ is_visible })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-sections'] });
    }
  });

  const resetForm = () => {
    setFormData({
      page_id: selectedPageId,
      section_type: "text",
      title_fr: "",
      title_ar: "",
      content_fr: "",
      content_ar: "",
      order_index: sections.length,
      is_visible: true,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: Section) => {
    setEditingItem(item);
    setFormData({
      page_id: item.page_id || "",
      section_type: item.section_type,
      title_fr: item.title_fr || "",
      title_ar: item.title_ar || "",
      content_fr: item.content_fr || "",
      content_ar: item.content_ar || "",
      order_index: item.order_index,
      is_visible: item.is_visible ?? true,
    });
    setIsDialogOpen(true);
  };

  const getSectionTypeLabel = (type: string) => {
    return sectionTypes.find(t => t.value === type)?.label || type;
  };

  const getPageTitle = (pageId: string | null) => {
    if (!pageId) return "Globale";
    const page = pages.find(p => p.id === pageId);
    return page?.title_fr || "Inconnue";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Gestion des Sections
          </CardTitle>
          <CardDescription>
            Créez et organisez les sections de vos pages (bilingue FR/AR)
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPageId || "all"} onValueChange={(v) => setSelectedPageId(v === "all" ? "" : v)}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Toutes les pages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les pages</SelectItem>
              {pages.map((page) => (
                <SelectItem key={page.id} value={page.id}>
                  {page.title_fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Modifier la section" : "Nouvelle section"}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...formData, id: editingItem?.id }); }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Page</Label>
                    <Select value={formData.page_id} onValueChange={(v) => setFormData(prev => ({ ...prev, page_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une page..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title_fr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type de section</Label>
                    <Select value={formData.section_type} onValueChange={(v) => setFormData(prev => ({ ...prev, section_type: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Titre (FR)</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                      placeholder="Titre de la section"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Titre (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      placeholder="عنوان القسم"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contenu (FR)</Label>
                  <RichTextEditor
                    value={formData.content_fr}
                    onChange={(value) => setFormData(prev => ({ ...prev, content_fr: value }))}
                    placeholder="Contenu de la section..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenu (AR)</Label>
                  <RichTextEditor
                    value={formData.content_ar}
                    onChange={(value) => setFormData(prev => ({ ...prev, content_ar: value }))}
                    placeholder="محتوى القسم..."
                    dir="rtl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="is_visible"
                      checked={formData.is_visible}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                    />
                    <Label htmlFor="is_visible">Section visible</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : sections.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune section{selectedPageId && " pour cette page"}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Ordre</TableHead>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Gestion</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {item.order_index}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.title_fr || <span className="text-muted-foreground italic">Sans titre</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getSectionTypeLabel(item.section_type)}</Badge>
                  </TableCell>
                  <TableCell>{getPageTitle(item.page_id)}</TableCell>
                  <TableCell>
                    {item.props && (item.props as any).admin_route ? (
                      <Link to={(item.props as any).admin_route} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" />
                        Gérer
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {item.props && (item.props as any).description ? (item.props as any).description : '—'}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleVisibilityMutation.mutate({ id: item.id, is_visible: !item.is_visible })}
                    >
                      {item.is_visible ? (
                        <Eye className="h-4 w-4 text-green-500" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette section ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
