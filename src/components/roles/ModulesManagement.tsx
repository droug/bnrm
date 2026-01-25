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
import { Plus, Pencil, Trash2, Library, BookOpen, FileText, Archive, Calendar, Puzzle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ModuleEditorDialog } from "./ModuleEditorDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  Puzzle,
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
      const { error } = await supabase.from("system_modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      toast.success("Module supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du module", { description: error.message });
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
    if (!iconName) return Puzzle;
    return ICON_MAP[iconName] || Puzzle;
  };

  const activeModules = modules?.filter(m => m.is_active).length || 0;
  const platforms = new Set(modules?.map(m => m.platform) || []);

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des modules...</p>
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
          <CardHeader className="bg-gradient-to-r from-rose-500/10 via-rose-400/5 to-transparent border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Puzzle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Modules</CardTitle>
                  <CardDescription>Créer et gérer les modules du système</CardDescription>
                </div>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Module
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-rose-600">{modules?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total modules</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-emerald-600">{activeModules}</p>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-blue-600">{platforms.size}</p>
                <p className="text-xs text-muted-foreground">Plateformes</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules?.map((module, index) => {
                  const Icon = getIcon(module.icon);
                  return (
                    <motion.tr
                      key={module.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="p-1.5 rounded-lg"
                            style={{ backgroundColor: `${module.color}15` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: module.color }} />
                          </div>
                          {module.code}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{module.platform}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {module.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={module.is_active ? "default" : "secondary"}
                          className={module.is_active ? "bg-emerald-500" : ""}
                        >
                          {module.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(module)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(module.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
                {!modules?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <Puzzle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Aucun module trouvé. Créez-en un pour commencer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <ModuleEditorDialog module={editingModule} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
