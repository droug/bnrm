import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Shield, Plus, Pencil, Trash2, Search } from "lucide-react";
import { PermissionEditorDialog } from "./PermissionEditorDialog";

interface Permission {
  id?: string;
  permission_name: string;
  category: string;
  description: string;
  created_at?: string;
}

export function PermissionsManagement() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Récupérer les permissions
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['workflow_permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_permissions')
        .select('*')
        .order('category')
        .order('permission_name');
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  // Mutation pour supprimer une permission
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_permissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_permissions'] });
      toast.success("Permission supprimée", {
        description: "La permission a été supprimée avec succès",
      });
      setPermissionToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Erreur", {
        description: error.message || "Impossible de supprimer la permission",
      });
    },
  });

  // Gérer la création
  const handleCreate = () => {
    setEditingPermission(null);
    setIsDialogOpen(true);
  };

  // Gérer l'édition
  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setIsDialogOpen(true);
  };

  // Gérer la suppression
  const handleDelete = (permission: Permission) => {
    setPermissionToDelete(permission);
  };

  const confirmDelete = () => {
    if (permissionToDelete?.id) {
      deleteMutation.mutate(permissionToDelete.id);
    }
  };

  // Filtrer les permissions
  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = 
      permission.permission_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || permission.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Extraire les catégories uniques
  const categories = Array.from(new Set(permissions?.map(p => p.category) || []));

  if (isLoading) {
    return <div className="text-center py-8">Chargement des permissions...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Gestion des Permissions</CardTitle>
              </div>
              <CardDescription>
                Gérer les permissions du système workflow
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Permission
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une permission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{permissions?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total permissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <p className="text-xs text-muted-foreground">Catégories</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{filteredPermissions.length}</div>
                <p className="text-xs text-muted-foreground">Affichées</p>
              </CardContent>
            </Card>
          </div>

          {/* Table des permissions */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la permission</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucune permission trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPermissions.map((permission) => (
                    <TableRow key={permission.id || permission.permission_name}>
                      <TableCell className="font-mono text-sm">
                        {permission.permission_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {permission.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(permission)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(permission)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'édition/création */}
      <PermissionEditorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        permission={editingPermission}
        onSave={() => {
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['workflow_permissions'] });
        }}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!permissionToDelete} onOpenChange={() => setPermissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la permission "{permissionToDelete?.permission_name}" ?
              Cette action est irréversible et peut affecter les rôles qui utilisent cette permission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
