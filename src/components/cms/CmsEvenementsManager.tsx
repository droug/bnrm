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
import { Plus, Edit, Trash2, Calendar, MapPin, Upload, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Evenement {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  lieu_fr: string | null;
  lieu_ar: string | null;
  date_debut: string;
  date_fin: string;
  affiche_url: string | null;
  affiche_alt_fr: string | null;
  affiche_alt_ar: string | null;
  cta_label_fr: string | null;
  cta_label_ar: string | null;
  cta_url: string | null;
  slug: string;
  status: string;
  event_type: string | null;
  tags: string[] | null;
  created_at: string | null;
}

export default function CmsEvenementsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Evenement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title_fr: "",
    title_ar: "",
    description_fr: "",
    description_ar: "",
    lieu_fr: "",
    lieu_ar: "",
    date_debut: "",
    date_fin: "",
    affiche_url: "",
    cta_label_fr: "",
    cta_label_ar: "",
    cta_url: "",
    slug: "",
    status: "draft",
    event_type: "",
    tags: ""
  });

  const { data: evenements = [], isLoading } = useQuery({
    queryKey: ['cms-evenements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_evenements')
        .select('*')
        .order('date_debut', { ascending: false });
      if (error) throw error;
      return data as Evenement[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        description_fr: data.description_fr || null,
        description_ar: data.description_ar || null,
        lieu_fr: data.lieu_fr || null,
        lieu_ar: data.lieu_ar || null,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        affiche_url: data.affiche_url || null,
        cta_label_fr: data.cta_label_fr || null,
        cta_label_ar: data.cta_label_ar || null,
        cta_url: data.cta_url || null,
        slug: data.slug || data.title_fr.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        status: data.status,
        event_type: data.event_type || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : null
      };

      if (data.id) {
        const { error } = await supabase
          .from('cms_evenements')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cms_evenements')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-evenements'] });
      toast({ title: editingItem ? "Événement mis à jour" : "Événement créé" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cms_evenements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-evenements'] });
      toast({ title: "Événement supprimé" });
    }
  });

  const resetForm = () => {
    setFormData({
      title_fr: "",
      title_ar: "",
      description_fr: "",
      description_ar: "",
      lieu_fr: "",
      lieu_ar: "",
      date_debut: "",
      date_fin: "",
      affiche_url: "",
      cta_label_fr: "",
      cta_label_ar: "",
      cta_url: "",
      slug: "",
      status: "draft",
      event_type: "",
      tags: ""
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: Evenement) => {
    setEditingItem(item);
    setFormData({
      title_fr: item.title_fr,
      title_ar: item.title_ar || "",
      description_fr: item.description_fr || "",
      description_ar: item.description_ar || "",
      lieu_fr: item.lieu_fr || "",
      lieu_ar: item.lieu_ar || "",
      date_debut: item.date_debut?.split('T')[0] || "",
      date_fin: item.date_fin?.split('T')[0] || "",
      affiche_url: item.affiche_url || "",
      cta_label_fr: item.cta_label_fr || "",
      cta_label_ar: item.cta_label_ar || "",
      cta_url: item.cta_url || "",
      slug: item.slug,
      status: item.status,
      event_type: item.event_type || "",
      tags: item.tags?.join(', ') || ""
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
      const fileName = `evenements/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('digital-library')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('digital-library')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, affiche_url: publicUrl }));
      toast({ title: "Affiche téléchargée" });
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

  const getEventStatus = (dateDebut: string, dateFin: string) => {
    const now = new Date();
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    
    if (now < start) return <Badge variant="outline">À venir</Badge>;
    if (now > end) return <Badge variant="secondary">Terminé</Badge>;
    return <Badge className="bg-green-500">En cours</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gestion des Événements
          </CardTitle>
          <CardDescription>
            Créez et gérez les événements avec dates et lieux bilingues
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
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
                    <Label>Description (FR)</Label>
                    <RichTextEditorCompact
                      value={formData.description_fr}
                      onChange={(value) => setFormData(prev => ({ ...prev, description_fr: value }))}
                      placeholder="Description de l'événement..."
                      minHeight="150px"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu (FR)</Label>
                    <Input
                      value={formData.lieu_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, lieu_fr: e.target.value }))}
                      placeholder="Ex: Auditorium BNRM, Rabat"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Libellé CTA (FR)</Label>
                      <Input
                        value={formData.cta_label_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_label_fr: e.target.value }))}
                        placeholder="Ex: S'inscrire"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL CTA</Label>
                      <Input
                        type="url"
                        value={formData.cta_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, cta_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
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
                    <Label>Description (AR)</Label>
                    <RichTextEditorCompact
                      value={formData.description_ar}
                      onChange={(value) => setFormData(prev => ({ ...prev, description_ar: value }))}
                      placeholder="وصف الحدث..."
                      minHeight="150px"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.lieu_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, lieu_ar: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Libellé CTA (AR)</Label>
                    <Input
                      dir="rtl"
                      value={formData.cta_label_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_label_ar: e.target.value }))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de début *</Label>
                      <Input
                        type="date"
                        value={formData.date_debut}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin *</Label>
                      <Input
                        type="date"
                        value={formData.date_fin}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_fin: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="mon-evenement"
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
                      <Label>Type d'événement</Label>
                      <Select value={formData.event_type} onValueChange={(v) => setFormData(prev => ({ ...prev, event_type: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conference">Conférence</SelectItem>
                          <SelectItem value="exposition">Exposition</SelectItem>
                          <SelectItem value="atelier">Atelier</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
                          <SelectItem value="concert">Concert</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <Input
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="culture, patrimoine..."
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Affiche</Label>
                    <div className="flex items-start gap-4">
                      {formData.affiche_url && (
                        <div className="relative">
                          <img src={formData.affiche_url} alt="" className="w-24 h-32 object-cover rounded" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={() => setFormData(prev => ({ ...prev, affiche_url: "" }))}
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
        ) : evenements.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Aucun événement</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evenements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-xs truncate">{item.title_fr}</TableCell>
                  <TableCell>{item.event_type || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(item.date_debut), 'dd/MM/yyyy', { locale: fr })} - {format(new Date(item.date_fin), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell>{getEventStatus(item.date_debut, item.date_fin)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
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
