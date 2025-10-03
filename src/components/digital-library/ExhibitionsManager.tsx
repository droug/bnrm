import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, Calendar as CalendarIcon, Users, Image, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Exhibition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  visitor_count: number;
  created_at: string;
}

export default function ExhibitionsManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExhibition, setEditingExhibition] = useState<Exhibition | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showResourcesDialog, setShowResourcesDialog] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Fetch exhibitions
  const { data: exhibitions, isLoading } = useQuery({
    queryKey: ['virtual-exhibitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('virtual_exhibitions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Exhibition[];
    }
  });

  // Fetch resources for an exhibition
  const { data: exhibitionResources } = useQuery({
    queryKey: ['exhibition-resources', showResourcesDialog],
    queryFn: async () => {
      if (!showResourcesDialog) return null;
      
      const { data, error } = await supabase
        .from('exhibition_resources')
        .select(`
          *,
          content:content_id (id, title, file_type)
        `)
        .eq('exhibition_id', showResourcesDialog)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!showResourcesDialog
  });

  // Fetch available content
  const { data: availableContent } = useQuery({
    queryKey: ['available-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, file_type')
        .in('content_type', ['page', 'news'])
        .eq('status', 'published')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  // Create exhibition
  const createExhibition = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('virtual_exhibitions')
        .insert({
          title: data.title,
          description: data.description,
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          is_active: data.is_active,
          created_by: user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-exhibitions'] });
      setShowAddDialog(false);
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      toast({ title: "Exposition créée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer l'exposition", variant: "destructive" });
    }
  });

  // Update exhibition
  const updateExhibition = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('virtual_exhibitions')
        .update({
          title: data.title,
          description: data.description,
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          is_active: data.is_active
        })
        .eq('id', editingExhibition?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-exhibitions'] });
      setEditingExhibition(null);
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      toast({ title: "Exposition mise à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'exposition", variant: "destructive" });
    }
  });

  // Delete exhibition
  const deleteExhibition = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('virtual_exhibitions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['virtual-exhibitions'] });
      setDeletingId(null);
      toast({ title: "Exposition supprimée" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de supprimer l'exposition", variant: "destructive" });
    }
  });

  // Add resource to exhibition
  const addResource = useMutation({
    mutationFn: async ({ exhibitionId, contentId }: { exhibitionId: string; contentId: string }) => {
      const { error } = await supabase
        .from('exhibition_resources')
        .insert({
          exhibition_id: exhibitionId,
          content_id: contentId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-resources'] });
      toast({ title: "Ressource ajoutée" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'ajouter la ressource", variant: "destructive" });
    }
  });

  // Remove resource from exhibition
  const removeResource = useMutation({
    mutationFn: async (resourceId: string) => {
      const { error } = await supabase
        .from('exhibition_resources')
        .delete()
        .eq('id', resourceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-resources'] });
      toast({ title: "Ressource retirée" });
    }
  });

  const onSubmit = (data: any) => {
    if (editingExhibition) {
      updateExhibition.mutate(data);
    } else {
      createExhibition.mutate(data);
    }
  };

  const getExhibitionStatus = (exhibition: Exhibition) => {
    const now = new Date();
    const start = new Date(exhibition.start_date);
    const end = new Date(exhibition.end_date);

    if (!exhibition.is_active) return { label: 'Inactive', variant: 'secondary' as const };
    if (now < start) return { label: 'À venir', variant: 'default' as const };
    if (now > end) return { label: 'Terminée', variant: 'outline' as const };
    return { label: 'En cours', variant: 'default' as const };
  };

  // Stats
  const totalExhibitions = exhibitions?.length || 0;
  const activeExhibitions = exhibitions?.filter(e => {
    const now = new Date();
    return e.is_active && new Date(e.start_date) <= now && new Date(e.end_date) >= now;
  }).length || 0;
  const totalVisitors = exhibitions?.reduce((sum, e) => sum + e.visitor_count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Expositions Virtuelles</h2>
          <p className="text-muted-foreground">Créer et gérer les expositions virtuelles avec suivi des visiteurs</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Exposition
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expositions</p>
                <p className="text-2xl font-bold">{totalExhibitions}</p>
              </div>
              <Image className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expositions Actives</p>
                <p className="text-2xl font-bold">{activeExhibitions}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Visiteurs</p>
                <p className="text-2xl font-bold">{totalVisitors.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exhibitions List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Expositions</CardTitle>
          <CardDescription>Gérez les expositions virtuelles et leurs ressources</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Visiteurs</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exhibitions?.map((exhibition) => {
                  const status = getExhibitionStatus(exhibition);
                  return (
                    <TableRow key={exhibition.id}>
                      <TableCell>
                        <div className="font-medium">{exhibition.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {exhibition.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{format(new Date(exhibition.start_date), 'dd/MM/yyyy')}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(exhibition.end_date), 'dd/MM/yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">{exhibition.visitor_count.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={exhibition.is_active ? "default" : "secondary"}>
                          {exhibition.is_active ? "Oui" : "Non"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingExhibition(exhibition);
                              setStartDate(new Date(exhibition.start_date));
                              setEndDate(new Date(exhibition.end_date));
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowResourcesDialog(exhibition.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(exhibition.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingExhibition} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingExhibition(null);
          reset();
          setStartDate(undefined);
          setEndDate(undefined);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingExhibition ? "Modifier l'Exposition" : "Nouvelle Exposition"}
            </DialogTitle>
            <DialogDescription>
              Définissez les informations et la période de l'exposition
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Titre *</Label>
              <Input
                {...register("title", { required: true })}
                defaultValue={editingExhibition?.title}
                placeholder="Titre de l'exposition"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                defaultValue={editingExhibition?.description}
                placeholder="Description de l'exposition"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Sélectionner"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                defaultChecked={editingExhibition?.is_active ?? true}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
              <Label htmlFor="is_active">Exposition active</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingExhibition(null);
              }}>
                Annuler
              </Button>
              <Button type="submit" disabled={!startDate || !endDate}>
                {editingExhibition ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resources Dialog */}
      <Dialog open={!!showResourcesDialog} onOpenChange={() => setShowResourcesDialog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ressources de l'Exposition</DialogTitle>
            <DialogDescription>Gérez les documents affichés dans cette exposition</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ajouter une ressource</Label>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => {
                  if (e.target.value && showResourcesDialog) {
                    addResource.mutate({
                      exhibitionId: showResourcesDialog,
                      contentId: e.target.value
                    });
                    e.target.value = '';
                  }
                }}
              >
                <option value="">Sélectionner un document...</option>
                {availableContent?.map((content) => (
                  <option key={content.id} value={content.id}>
                    {content.title} ({content.file_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <h4 className="font-medium mb-2">Ressources actuelles</h4>
              <div className="space-y-2">
                {exhibitionResources?.map((resource: any) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{resource.content?.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.content?.file_type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource.mutate(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette exposition ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteExhibition.mutate(deletingId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
