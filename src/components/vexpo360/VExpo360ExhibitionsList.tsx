import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, MoreHorizontal, Edit, Eye, Trash2, Copy, Send, Archive, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Exhibition {
  id: string;
  slug: string;
  title_fr: string;
  title_ar: string | null;
  status: 'draft' | 'in_review' | 'published' | 'archived';
  start_date: string | null;
  end_date: string | null;
  visitor_count: number;
  created_at: string;
}

export default function VExpo360ExhibitionsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch exhibitions
  const { data: exhibitions, isLoading } = useQuery({
    queryKey: ['vexpo360-exhibitions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('vexpo_exhibitions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Exhibition[];
    }
  });

  // Delete mutation
  const deleteExhibition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vexpo_exhibitions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-exhibitions'] });
      toast({ title: "Exposition supprimée avec succès" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'exposition", variant: "destructive" });
    }
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'in_review' | 'published' | 'archived' }) => {
      const updates: Record<string, any> = { status };
      
      if (status === 'in_review') {
        updates.submitted_at = new Date().toISOString();
      } else if (status === 'published') {
        updates.published_at = new Date().toISOString();
        updates.published_by = user?.id;
      } else if (status === 'archived') {
        updates.archived_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('vexpo_exhibitions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-exhibitions'] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    }
  });

  // Clone mutation
  const cloneExhibition = useMutation({
    mutationFn: async (exhibition: Exhibition) => {
      const { data: original, error: fetchError } = await supabase
        .from('vexpo_exhibitions')
        .select('*')
        .eq('id', exhibition.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error: insertError } = await supabase
        .from('vexpo_exhibitions')
        .insert({
          title_fr: `${original.title_fr} (copie)`,
          title_ar: original.title_ar,
          teaser_fr: original.teaser_fr,
          teaser_ar: original.teaser_ar,
          intro_fr: original.intro_fr,
          intro_ar: original.intro_ar,
          cover_image_url: original.cover_image_url,
          cta_title_fr: original.cta_title_fr,
          cta_title_ar: original.cta_title_ar,
          opening_hours_fr: original.opening_hours_fr,
          opening_hours_ar: original.opening_hours_ar,
          location_text_fr: original.location_text_fr,
          location_text_ar: original.location_text_ar,
          map_link: original.map_link,
          primary_button_label_fr: original.primary_button_label_fr,
          primary_button_label_ar: original.primary_button_label_ar,
          meta_title_fr: original.meta_title_fr,
          meta_description_fr: original.meta_description_fr,
          meta_title_ar: original.meta_title_ar,
          meta_description_ar: original.meta_description_ar,
          status: 'draft' as const,
          visitor_count: 0,
          created_by: user?.id
        });
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vexpo360-exhibitions'] });
      toast({ title: "Exposition dupliquée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de dupliquer l'exposition", variant: "destructive" });
    }
  });

  const filteredExhibitions = exhibitions?.filter(e => 
    e.title_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.title_ar?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      case 'in_review':
        return <Badge variant="default" className="bg-amber-500">En révision</Badge>;
      case 'published':
        return <Badge variant="default" className="bg-green-500">Publié</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des Expositions</CardTitle>
              <CardDescription>Gérez vos expositions virtuelles 360°</CardDescription>
            </div>
            <Button onClick={() => navigate("/admin/vexpo360/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Exposition
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une exposition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'in_review', 'published', 'archived'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' ? 'Tous' :
                   status === 'draft' ? 'Brouillons' :
                   status === 'in_review' ? 'En révision' :
                   status === 'published' ? 'Publiées' : 'Archivées'}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredExhibitions && filteredExhibitions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Visiteurs</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExhibitions.map((exhibition) => (
                  <TableRow key={exhibition.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exhibition.title_fr}</p>
                        {exhibition.title_ar && (
                          <p className="text-sm text-muted-foreground" dir="rtl">{exhibition.title_ar}</p>
                        )}
                        <p className="text-xs text-muted-foreground">/{exhibition.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(exhibition.status)}</TableCell>
                    <TableCell>
                      {exhibition.start_date && exhibition.end_date ? (
                        <span className="text-sm">
                          {format(new Date(exhibition.start_date), 'dd/MM/yy')} - {format(new Date(exhibition.end_date), 'dd/MM/yy')}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Non définie</span>
                      )}
                    </TableCell>
                    <TableCell>{exhibition.visitor_count.toLocaleString()}</TableCell>
                    <TableCell>
                      {format(new Date(exhibition.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/vexpo360/edit/${exhibition.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/digital-library/exposition-virtuelle/${exhibition.slug}`, '_blank')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Prévisualiser
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => cloneExhibition.mutate(exhibition)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {exhibition.status === 'draft' && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: exhibition.id, status: 'in_review' })}>
                              <Send className="h-4 w-4 mr-2" />
                              Soumettre pour révision
                            </DropdownMenuItem>
                          )}
                          {exhibition.status === 'in_review' && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: exhibition.id, status: 'published' })}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Publier
                            </DropdownMenuItem>
                          )}
                          {exhibition.status === 'published' && (
                            <DropdownMenuItem onClick={() => updateStatus.mutate({ id: exhibition.id, status: 'archived' })}>
                              <Archive className="h-4 w-4 mr-2" />
                              Archiver
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(exhibition.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune exposition trouvée</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/vexpo360/new")}>
                Créer votre première exposition
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'exposition et tous ses éléments (panoramas, hotspots) seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteExhibition.mutate(deleteId)}
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
