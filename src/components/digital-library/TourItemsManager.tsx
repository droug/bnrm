import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";

interface TourItem {
  id: string;
  exhibition_id: string;
  item_type: string;
  title: string;
  description: string | null;
  image_url: string | null;
  year: string | null;
  origin: string | null;
  technique: string | null;
  dimensions: string | null;
  details: string | null;
  display_order: number;
  is_active: boolean;
}

interface TourItemsManagerProps {
  exhibitionId: string;
  exhibitionTitle: string;
  onClose: () => void;
}

export default function TourItemsManager({ exhibitionId, exhibitionTitle, onClose }: TourItemsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<TourItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const itemType = watch("item_type", "document");

  // Fetch tour items
  const { data: tourItems, isLoading } = useQuery({
    queryKey: ['exhibition-tour-items', exhibitionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exhibition_tour_items')
        .select('*')
        .eq('exhibition_id', exhibitionId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as TourItem[];
    }
  });

  // Create tour item
  const createItem = useMutation({
    mutationFn: async (data: any) => {
      const maxOrder = tourItems?.length ? Math.max(...tourItems.map(i => i.display_order)) + 1 : 0;
      
      const { error } = await supabase
        .from('exhibition_tour_items')
        .insert({
          exhibition_id: exhibitionId,
          item_type: data.item_type,
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          year: data.year,
          origin: data.origin,
          technique: data.technique,
          dimensions: data.dimensions,
          details: data.details,
          display_order: maxOrder,
          is_active: data.is_active ?? true
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-tour-items', exhibitionId] });
      setShowAddDialog(false);
      reset();
      toast({ title: "Élément ajouté avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'élément", variant: "destructive" });
    }
  });

  // Update tour item
  const updateItem = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('exhibition_tour_items')
        .update({
          item_type: data.item_type,
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          year: data.year,
          origin: data.origin,
          technique: data.technique,
          dimensions: data.dimensions,
          details: data.details,
          is_active: data.is_active
        })
        .eq('id', editingItem?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-tour-items', exhibitionId] });
      setEditingItem(null);
      reset();
      toast({ title: "Élément mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour l'élément", variant: "destructive" });
    }
  });

  // Delete tour item
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exhibition_tour_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-tour-items', exhibitionId] });
      setDeletingId(null);
      toast({ title: "Élément supprimé" });
    }
  });

  // Update order
  const updateOrder = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('exhibition_tour_items')
        .update({ display_order: newOrder })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exhibition-tour-items', exhibitionId] });
    }
  });

  const onSubmit = (data: any) => {
    if (editingItem) {
      updateItem.mutate(data);
    } else {
      createItem.mutate(data);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!tourItems) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= tourItems.length) return;
    
    const currentItem = tourItems[index];
    const swapItem = tourItems[newIndex];
    
    updateOrder.mutate({ id: currentItem.id, newOrder: swapItem.display_order });
    updateOrder.mutate({ id: swapItem.id, newOrder: currentItem.display_order });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'intro': return 'Introduction';
      case 'document': return 'Document';
      case 'section': return 'Section';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'intro': return 'bg-purple-500';
      case 'document': return 'bg-blue-500';
      case 'section': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Éléments de la visite guidée</DialogTitle>
          <DialogDescription>
            Gérez les étapes de la visite guidée pour "{exhibitionTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un élément
            </Button>
          </div>

          {isLoading ? (
            <p className="text-center py-4">Chargement...</p>
          ) : tourItems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élément de visite configuré</p>
              <p className="text-sm">Ajoutez des documents pour créer la visite guidée</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tourItems?.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="text-xs disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <span className="text-center">{index + 1}</span>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === tourItems.length - 1}
                          className="text-xs disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(item.item_type)}>
                        {getTypeLabel(item.item_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{item.year || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Oui" : "Non"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setValue("item_type", item.item_type);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingItem(null);
          reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier l'élément" : "Nouvel élément de visite"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select 
                  defaultValue={editingItem?.item_type || "document"}
                  onValueChange={(val) => setValue("item_type", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Introduction</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="section">Section</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Switch
                  id="is_active"
                  defaultChecked={editingItem?.is_active ?? true}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <Label htmlFor="is_active">Actif</Label>
              </div>
            </div>

            <div>
              <Label>Titre *</Label>
              <Input
                {...register("title", { required: true })}
                defaultValue={editingItem?.title}
                placeholder="Titre de l'élément"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                {...register("description")}
                defaultValue={editingItem?.description || ""}
                placeholder="Description courte"
                rows={2}
              />
            </div>

            <div>
              <Label>URL de l'image</Label>
              <Input
                {...register("image_url")}
                defaultValue={editingItem?.image_url || ""}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {itemType === 'document' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Année / Période</Label>
                    <Input
                      {...register("year")}
                      defaultValue={editingItem?.year || ""}
                      placeholder="ex: XIIIe siècle"
                    />
                  </div>
                  <div>
                    <Label>Origine</Label>
                    <Input
                      {...register("origin")}
                      defaultValue={editingItem?.origin || ""}
                      placeholder="ex: Fès, Maroc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Technique</Label>
                    <Input
                      {...register("technique")}
                      defaultValue={editingItem?.technique || ""}
                      placeholder="ex: Enluminure sur parchemin"
                    />
                  </div>
                  <div>
                    <Label>Dimensions</Label>
                    <Input
                      {...register("dimensions")}
                      defaultValue={editingItem?.dimensions || ""}
                      placeholder="ex: 32 x 24 cm"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Détails / Texte complet</Label>
              <Textarea
                {...register("details")}
                defaultValue={editingItem?.details || ""}
                placeholder="Description détaillée affichée lors de la visite"
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingItem(null);
                reset();
              }}>
                Annuler
              </Button>
              <Button type="submit">
                {editingItem ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément de la visite ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && deleteItem.mutate(deletingId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
