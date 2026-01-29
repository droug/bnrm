import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditorCompact from "@/components/cms/RichTextEditorCompact";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Megaphone, Upload, Loader2, X, GripVertical, ExternalLink, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import BannerPreview from "@/components/cms/BannerPreview";

interface Banner {
  id: string;
  title_fr: string | null;
  title_ar: string | null;
  text_fr: string | null;
  text_ar: string | null;
  image_url: string;
  image_alt_fr: string | null;
  image_alt_ar: string | null;
  link_url: string | null;
  link_label_fr: string | null;
  link_label_ar: string | null;
  position: string | null;
  priority: number | null;
  status: string;
  is_active: boolean | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
}

export default function CmsBannersManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Banner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title_fr: "",
    title_ar: "",
    text_fr: "",
    text_ar: "",
    image_url: "",
    image_alt_fr: "",
    image_alt_ar: "",
    link_url: "",
    link_label_fr: "",
    link_label_ar: "",
    position: "hero",
    priority: 1,
    status: "draft",
    is_active: true,
    start_date: "",
    end_date: ""
  });

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['cms-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_bannieres')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as Banner[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        title_fr: data.title_fr || null,
        title_ar: data.title_ar || null,
        text_fr: data.text_fr || null,
        text_ar: data.text_ar || null,
        image_url: data.image_url,
        image_alt_fr: data.image_alt_fr || null,
        image_alt_ar: data.image_alt_ar || null,
        link_url: data.link_url || null,
        link_label_fr: data.link_label_fr || null,
        link_label_ar: data.link_label_ar || null,
        position: data.position,
        priority: data.priority,
        status: data.status,
        is_active: data.is_active,
        start_date: data.start_date || null,
        end_date: data.end_date || null
      };

      if (data.id) {
        const { error } = await supabase
          .from('cms_bannieres')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_bannieres')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-banners'] });
      toast({ title: editingItem ? "Bannière mise à jour" : "Bannière créée" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_bannieres')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-banners'] });
      toast({ title: "Bannière supprimée" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('cms_bannieres')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-banners'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_ar: "",
      text_fr: "",
      text_ar: "",
      image_url: "",
      image_alt_fr: "",
      image_alt_ar: "",
      link_url: "",
      link_label_fr: "",
      link_label_ar: "",
      position: "hero",
      priority: 1,
      status: "draft",
      is_active: true,
      start_date: "",
      end_date: ""
    });
    setEditingItem(null);
    setIsDialogOpen(false);
    setShowPreview(false);
  };

  const handleEdit = (item: Banner) => {
    setEditingItem(item);
    setFormData({
      title_fr: item.title_fr || "",
      title_ar: item.title_ar || "",
      text_fr: item.text_fr || "",
      text_ar: item.text_ar || "",
      image_url: item.image_url,
      image_alt_fr: item.image_alt_fr || "",
      image_alt_ar: item.image_alt_ar || "",
      link_url: item.link_url || "",
      link_label_fr: item.link_label_fr || "",
      link_label_ar: item.link_label_ar || "",
      position: item.position || "hero",
      priority: item.priority || 1,
      status: item.status,
      is_active: item.is_active ?? true,
      start_date: item.start_date || "",
      end_date: item.end_date || ""
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5 Mo", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bannieres/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('digital-library')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('digital-library')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Image téléchargée" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean | null) => {
    if (!isActive) {
      return <Badge variant="outline" className="text-gray-500">Désactivé</Badge>;
    }
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Programmé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPositionLabel = (position: string | null) => {
    switch (position) {
      case 'hero': return 'Hero (Accueil)';
      case 'sidebar': return 'Barre latérale';
      case 'footer': return 'Pied de page';
      case 'popup': return 'Popup';
      default: return position || '-';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Megaphone className="h-5 w-5 text-pink-500" />
            </div>
            Gestion des Bannières
          </CardTitle>
          <CardDescription>
            Créez et gérez les bannières promotionnelles du site avec planification
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4" />
              Nouvelle bannière
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier la bannière" : "Nouvelle bannière"}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulaire */}
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...formData, id: editingItem?.id }); }} className="space-y-6">
                <Tabs defaultValue="content-fr">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content-fr">Contenu FR</TabsTrigger>
                    <TabsTrigger value="content-ar">Contenu AR</TabsTrigger>
                    <TabsTrigger value="settings">Paramètres</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content-fr" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Titre (FR)</Label>
                      <Input
                        value={formData.title_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                        placeholder="Titre de la bannière"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texte (FR)</Label>
                      <RichTextEditorCompact
                        value={formData.text_fr}
                        onChange={(value) => setFormData(prev => ({ ...prev, text_fr: value }))}
                        placeholder="Description ou message..."
                        minHeight="100px"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Libellé du lien (FR)</Label>
                      <Input
                        value={formData.link_label_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, link_label_fr: e.target.value }))}
                        placeholder="En savoir plus"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt image (FR)</Label>
                      <Input
                        value={formData.image_alt_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_alt_fr: e.target.value }))}
                        placeholder="Description de l'image"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content-ar" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Titre (AR)</Label>
                      <Input
                        dir="rtl"
                        value={formData.title_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Texte (AR)</Label>
                      <RichTextEditorCompact
                        value={formData.text_ar}
                        onChange={(value) => setFormData(prev => ({ ...prev, text_ar: value }))}
                        placeholder="النص العربي..."
                        minHeight="100px"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Libellé du lien (AR)</Label>
                      <Input
                        dir="rtl"
                        value={formData.link_label_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, link_label_ar: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alt image (AR)</Label>
                      <Input
                        dir="rtl"
                        value={formData.image_alt_ar}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_alt_ar: e.target.value }))}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={formData.position} onValueChange={(v) => setFormData(prev => ({ ...prev, position: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hero">Hero (Accueil)</SelectItem>
                            <SelectItem value="sidebar">Barre latérale</SelectItem>
                            <SelectItem value="footer">Pied de page</SelectItem>
                            <SelectItem value="popup">Popup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priorité</Label>
                        <Input
                          type="number"
                          min={1}
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="published">Publié</SelectItem>
                            <SelectItem value="scheduled">Programmé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>URL du lien</Label>
                        <Input
                          value={formData.link_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de début</Label>
                        <Input
                          type="datetime-local"
                          value={formData.start_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date de fin</Label>
                        <Input
                          type="datetime-local"
                          value={formData.end_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>Bannière active</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Image *</Label>
                      <div className="flex items-start gap-4">
                        {formData.image_url && (
                          <div className="relative">
                            <img src={formData.image_url} alt="" className="w-40 h-24 object-cover rounded-lg border" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          />
                          <Button type="button" variant="outline" disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            {isUploading ? "Téléchargement..." : "Télécharger"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>Annuler</Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Masquer" : "Prévisualiser"}
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending || !formData.image_url}>
                    {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </DialogFooter>
              </form>

              {/* Prévisualisation temps réel */}
              {showPreview && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Prévisualisation
                  </h3>
                  <BannerPreview 
                    title={formData.title_fr}
                    text={formData.text_fr}
                    imageUrl={formData.image_url}
                    linkUrl={formData.link_url}
                    linkLabel={formData.link_label_fr}
                    position={formData.position}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">Aucune bannière configurée</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer une bannière
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {banners.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.image_alt_fr || ''} 
                    className="w-24 h-16 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{item.title_fr || 'Sans titre'}</h4>
                    {getStatusBadge(item.status, item.is_active)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{getPositionLabel(item.position)}</span>
                    <span>Priorité: {item.priority}</span>
                    {item.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.start_date), 'dd/MM/yyyy', { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.is_active ?? true}
                    onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: item.id, is_active: checked })}
                  />
                  
                  {item.link_url && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={item.link_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette bannière ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
