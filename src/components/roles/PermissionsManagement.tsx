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
import { Lock, Plus, Pencil, Trash2, Search, Loader2, Key, Tag, Filter } from "lucide-react";
import { PermissionEditorDialog } from "./PermissionEditorDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_permissions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_permissions'] });
      toast.success("Permission supprimée avec succès");
      setPermissionToDelete(null);
    },
    onError: (error: any) => {
      toast.error("Erreur", { description: error.message });
    },
  });

  const handleCreate = () => {
    setEditingPermission(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setIsDialogOpen(true);
  };

  const handleDelete = (permission: Permission) => {
    setPermissionToDelete(permission);
  };

  const confirmDelete = () => {
    if (permissionToDelete?.id) {
      deleteMutation.mutate(permissionToDelete.id);
    }
  };

  const filteredPermissions = permissions?.filter(permission => {
    const matchesSearch = 
      permission.permission_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || permission.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(permissions?.map(p => p.category) || []));

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des permissions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Permissions</CardTitle>
                  <CardDescription>Gérer les permissions du système workflow</CardDescription>
                </div>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Permission
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-background/50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-emerald-600" />
                  <p className="text-2xl font-bold text-emerald-600">{permissions?.length || 0}</p>
                </div>
                <p className="text-xs text-muted-foreground">Total permissions</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Catégories</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">{filteredPermissions.length}</p>
                </div>
                <p className="text-xs text-muted-foreground">Affichées</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une permission..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    selectedCategory === "all"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  Toutes
                </motion.button>
                {categories.slice(0, 5).map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      selectedCategory === category
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Nom de la permission</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Aucune permission trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((permission, index) => (
                      <motion.tr
                        key={permission.id || permission.permission_name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-emerald-500" />
                            {permission.permission_name}
                          </div>
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
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(permission)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(permission)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PermissionEditorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        permission={editingPermission}
        onSave={() => {
          setIsDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['workflow_permissions'] });
        }}
      />

      <AlertDialog open={!!permissionToDelete} onOpenChange={() => setPermissionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la permission "{permissionToDelete?.permission_name}" ?
              Cette action est irréversible.
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
