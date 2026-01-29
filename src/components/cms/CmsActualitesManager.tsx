import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditorCompact from "@/components/cms/RichTextEditorCompact";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Calendar, Newspaper, Upload, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Actualite {
  id: string;
  title_fr: string;
  title_ar: string | null;
  chapo_fr: string | null;
  chapo_ar: string | null;
  body_fr: string | null;
  body_ar: string | null;
  image_url: string | null;
  image_alt_fr: string | null;
  image_alt_ar: string | null;
  slug: string;
  status: string;
  category: string | null;
  tags: string[] | null;
  date_publication: string | null;
  view_count: number | null;
  created_at: string | null;
}

export default function CmsActualitesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Actualite | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title_fr: "",
    title_ar: "",
    chapo_fr: "",
    chapo_ar: "",
    body_fr: "",
    body_ar: "",
    image_url: "",
    image_alt_fr: "",
    image_alt_ar: "",
    slug: "",
    status: "draft",
    category: "",
    tags: "",
    date_publication: ""
  });

  const { data: actualites = [], isLoading } = useQuery({
    queryKey: ['cms-actualites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_actualites')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Actualite[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        chapo_fr: data.chapo_fr || null,
        chapo_ar: data.chapo_ar || null,
        body_fr: data.body_fr || null,
        body_ar: data.body_ar || null,
        image_url: data.image_url || null,
        image_alt_fr: data.image_alt_fr || null,
        image_alt_ar: data.image_alt_ar || null,
        slug: data.slug || data.title_fr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        status: data.status,
        category: data.category || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : null,
        date_publication: data.date_publication || null
      };

      if (data.id) {
        const { error } = await supabase
          .from('cms_actualites')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_actualites')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-actualites'] });
      toast({ title: editingItem ? "Actualité mise à jour" : "Actualité créée" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_actualites')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-actualites'] });
      toast({ title: "Actualité supprimée" });
    }
  });

  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_ar: "",
      chapo_fr: "",
      chapo_ar: "",
      body_fr: "",
      body_ar: "",
      image_url: "",
      image_alt_fr: "",
      image_alt_ar: "",
      slug: "",
      status: "draft",
      category: "",
      tags: "",
      date_publication: ""
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: Actualite) => {
    setEditingItem(item);
    setFormData({
      title_fr: item.title_fr,
      title_ar: item.title_ar || "",
      chapo_fr: item.chapo_fr || "",
      chapo_ar: item.chapo_ar || "",
      body_fr: item.body_fr || "",
      body_ar: item.body_ar || "",
      image_url: item.image_url || "",
      image_alt_fr: item.image_alt_fr || "",
      image_alt_ar: item.image_alt_ar || "",
      slug: item.slug,
      status: item.status,
      category: item.category || "",
      tags: item.tags?.join(', ') || "",
      date_publication: item.date_publication || ""
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
      const fileName = `actualites/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Publié</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Gestion des Actualités
          </CardTitle>
          <CardDescription>
            Créez et gérez les actualités bilingues FR/AR
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle actualité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'actualité" : "Nouvelle actualité"}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...formData, id: editingItem?.id }); }} className="space-y-6">
              <Tabs defaultValue="content-fr">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content-fr">Contenu FR</TabsTrigger>
                  <TabsTrigger value="content-ar">Contenu AR</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content-fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre (FR) *</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chapô (FR)</Label>
                    <RichTextEditorCompact
                      value={formData.chapo_fr}
                      onChange={(value) => setFormData(prev => ({ ...prev, chapo_fr: value }))}
                      placeholder="Résumé court de l'actualité..."
                      minHeight="80px"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (FR)</Label>
                    <RichTextEditorCompact
                      value={formData.body_fr}
                      onChange={(value) => setFormData(prev => ({ ...prev, body_fr: value }))}
                      placeholder="Contenu complet de l'actualité..."
                      minHeight="200px"
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
                    <Label>Chapô (AR)</Label>
                    <RichTextEditorCompact
                      value={formData.chapo_ar}
                      onChange={(value) => setFormData(prev => ({ ...prev, chapo_ar: value }))}
                      placeholder="ملخص قصير..."
                      minHeight="80px"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (AR)</Label>
                    <RichTextEditorCompact
                      value={formData.body_ar}
                      onChange={(value) => setFormData(prev => ({ ...prev, body_ar: value }))}
                      placeholder="المحتوى الكامل..."
                      minHeight="200px"
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="mon-actualite"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="published">Publié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="institutionnel">Institutionnel</SelectItem>
                          <SelectItem value="culturel">Culturel</SelectItem>
                          <SelectItem value="scientifique">Scientifique</SelectItem>
                          <SelectItem value="partenariat">Partenariat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date de publication</Label>
                      <Input
                        type="date"
                        value={formData.date_publication}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_publication: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tags (séparés par des virgules)</Label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="culture, patrimoine, événement..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div className="flex items-start gap-4">
                      {formData.image_url && (
                        <div className="relative">
                          <img src={formData.image_url} alt="" className="w-32 h-20 object-cover rounded" />
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
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : actualites.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucune actualité</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actualites.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.title_fr}</TableCell>
                  <TableCell>{item.category || "-"}</TableCell>
                  <TableCell>
                    {item.date_publication ? format(new Date(item.date_publication), 'dd MMM yyyy', { locale: fr }) : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.view_count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer cette actualité ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(item.id)}>Supprimer</AlertDialogAction>
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
