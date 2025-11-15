import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Library, BookOpen, FileText, Archive, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ModuleEditorDialog } from "./ModuleEditorDialog";

interface Module {
  id: string;
  code: string;
  name: string;
  platform: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

const ICON_MAP: Record<string, any> = {
  Library,
  BookOpen,
  FileText,
  Archive,
  Calendar,
};

export function ModulesManagement() {
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_modules")
        .select("*")
        .order("platform", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Module[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("system_modules")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Module supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du module", {
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    setEditingModule(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      deleteMutation.mutate(id);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Library;
    return ICON_MAP[iconName] || Library;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Chargement des modules...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Modules</CardTitle>
              <CardDescription>
                Créer et gérer les modules du système
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Module
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Plateforme</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules?.map((module) => {
                const Icon = getIcon(module.icon);
                return (
                  <TableRow key={module.id}>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {module.code}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{module.platform}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {module.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={module.is_active ? "default" : "secondary"}>
                        {module.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(module)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(module.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!modules?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun module trouvé. Créez-en un pour commencer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ModuleEditorDialog
        module={editingModule}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
