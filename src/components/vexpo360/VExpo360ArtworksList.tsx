import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Image, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Artwork {
  id: string;
  title_fr: string;
  title_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  creator_author: string | null;
  creation_date: string | null;
  artwork_type: string | null;
  inventory_id: string | null;
  keywords: string[] | null;
  images: any[];
  external_catalog_url: string | null;
  is_active: boolean;
  created_at: string;
}

const artworkTypes = [
  { value: 'manuscript', label: 'Manuscrit' },
  { value: 'photo', label: 'Photographie' },
  { value: 'book', label: 'Livre' },
  { value: 'map', label: 'Carte' },
  { value: 'painting', label: 'Peinture' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'document', label: 'Document' },
  { value: 'artifact', label: 'Artefact' },
  { value: 'other', label: 'Autre' }
];

export default function VExpo360ArtworksList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_ar: '',
    description_fr: '',
    description_ar: '',
    creator_author: '',
    creation_date: '',
    artwork_type: '',
    inventory_id: '',
    keywords: '',
    external_catalog_url: '',
    visit_cta_text_fr: '',
    visit_cta_text_ar: ''
  });

  // Fetch artworks
  const { data: artworks, isLoading } = useQuery({
    queryKey: ['vexpo360-artworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vexpo_artworks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Artwork[];
    }
  });

  // Create/Update mutation
  const saveArtwork = useMutation({
    mutationFn: async (data: typeof formData) => {
      const artworkData = {
        title_fr: data.title_fr,
        title_ar: data.title_ar || null,
        description_fr: data.description_fr || null,
        description_ar: data.description_ar || null,
        creator_author: data.creator_author || null,
        creation_date: data.creation_date || null,
        artwork_type: data.artwork_type || null,
        inventory_id: data.inventory_id || null,
        keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()) : null,
        external_catalog_url: data.external_catalog_url || null,
        visit_cta_text_fr: data.visit_cta_text_fr || null,
        visit_cta_text_ar: data.visit_cta_text_ar || null,
        updated_by: user?.id
      };

      if (editingArtwork) {
        const { error } = await supabase
          .from('vexpo_artworks')
          .update(artworkData)
          .eq('id', editingArtwork.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vexpo_artworks')
          .insert({ ...artworkData, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-artworks'] });
      toast({ title: editingArtwork ? "Œuvre mise à jour" : "Œuvre créée avec succès" });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de sauvegarder l'œuvre", variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteArtwork = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vexpo_artworks')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-artworks'] });
      toast({ title: "Œuvre supprimée" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'œuvre", variant: "destructive" });
    }
  });

  const handleOpenDialog = (artwork?: Artwork) => {
    if (artwork) {
      setEditingArtwork(artwork);
      setFormData({
        title_fr: artwork.title_fr,
        title_ar: artwork.title_ar || '',
        description_fr: artwork.description_fr || '',
        description_ar: artwork.description_ar || '',
        creator_author: artwork.creator_author || '',
        creation_date: artwork.creation_date || '',
        artwork_type: artwork.artwork_type || '',
        inventory_id: artwork.inventory_id || '',
        keywords: artwork.keywords?.join(', ') || '',
        external_catalog_url: artwork.external_catalog_url || '',
        visit_cta_text_fr: '',
        visit_cta_text_ar: ''
      });
    } else {
      setEditingArtwork(null);
      setFormData({
        title_fr: '',
        title_ar: '',
        description_fr: '',
        description_ar: '',
        creator_author: '',
        creation_date: '',
        artwork_type: '',
        inventory_id: '',
        keywords: '',
        external_catalog_url: '',
        visit_cta_text_fr: '',
        visit_cta_text_ar: ''
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingArtwork(null);
  };

  const filteredArtworks = artworks?.filter(a => 
    a.title_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.title_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.creator_author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Œuvres et Notices</CardTitle>
              <CardDescription>Gérez les œuvres disponibles pour les hotspots</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Œuvre
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une œuvre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredArtworks && filteredArtworks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Auteur/Créateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>ID Inventaire</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtworks.map((artwork) => (
                  <TableRow key={artwork.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Image className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{artwork.title_fr}</p>
                          {artwork.title_ar && (
                            <p className="text-sm text-muted-foreground" dir="rtl">{artwork.title_ar}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{artwork.creator_author || '-'}</TableCell>
                    <TableCell>
                      {artwork.artwork_type ? (
                        <Badge variant="outline">
                          {artworkTypes.find(t => t.value === artwork.artwork_type)?.label || artwork.artwork_type}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{artwork.inventory_id || '-'}</TableCell>
                    <TableCell>
                      {format(new Date(artwork.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(artwork)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {artwork.external_catalog_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={artwork.external_catalog_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(artwork.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune œuvre trouvée</p>
              <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
                Créer votre première œuvre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArtwork ? "Modifier l'œuvre" : "Nouvelle Œuvre"}</DialogTitle>
            <DialogDescription>
              Renseignez les informations de l'œuvre en français et en arabe
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="fr" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="ar">العربية</TabsTrigger>
            </TabsList>

            <TabsContent value="fr" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={formData.title_fr}
                  onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                  placeholder="Titre de l'œuvre"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  placeholder="Description détaillée..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="ar" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="عنوان العمل"
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  placeholder="وصف مفصل..."
                  rows={4}
                  dir="rtl"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <Label>Auteur/Créateur</Label>
              <Input
                value={formData.creator_author}
                onChange={(e) => setFormData({ ...formData, creator_author: e.target.value })}
                placeholder="Nom de l'auteur"
              />
            </div>
            <div className="space-y-2">
              <Label>Date de création</Label>
              <Input
                value={formData.creation_date}
                onChange={(e) => setFormData({ ...formData, creation_date: e.target.value })}
                placeholder="ex: XIVe siècle, 1920..."
              />
            </div>
            <div className="space-y-2">
              <Label>Type d'œuvre</Label>
              <select
                value={formData.artwork_type}
                onChange={(e) => setFormData({ ...formData, artwork_type: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Sélectionner...</option>
                {artworkTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>ID Inventaire</Label>
              <Input
                value={formData.inventory_id}
                onChange={(e) => setFormData({ ...formData, inventory_id: e.target.value })}
                placeholder="Numéro d'inventaire"
              />
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label>Mots-clés (séparés par des virgules)</Label>
            <Input
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="manuscrit, histoire, patrimoine..."
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label>URL du catalogue externe</Label>
            <Input
              value={formData.external_catalog_url}
              onChange={(e) => setFormData({ ...formData, external_catalog_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              onClick={() => saveArtwork.mutate(formData)}
              disabled={!formData.title_fr || saveArtwork.isPending}
            >
              {saveArtwork.isPending ? 'Enregistrement...' : editingArtwork ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'œuvre sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteArtwork.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
