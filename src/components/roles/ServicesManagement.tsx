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
import { Plus, Pencil, Trash2, Settings, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ServiceEditorDialog } from "./ServiceEditorDialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Service {
  id: string;
  code: string;
  name: string;
  module_id?: string;
  description?: string;
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
}

export function ServicesManagement() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_services")
        .select(`*, system_modules (name, platform)`)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as any[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("system_services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du service", { description: error.message });
    },
  });

  const handleCreate = () => {
    setEditingService(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      deleteMutation.mutate(id);
    }
  };

  const activeServices = services?.filter(s => s.is_active).length || 0;
  const approvalRequired = services?.filter(s => s.requires_approval).length || 0;

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des services...</p>
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
          <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-indigo-400/5 to-transparent border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Settings className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gestion des Services</CardTitle>
                  <CardDescription>Créer et gérer les services du système</CardDescription>
                </div>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Service
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-indigo-600">{services?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total services</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-emerald-600">{activeServices}</p>
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
              <div className="bg-background/50 rounded-lg p-3 border">
                <p className="text-2xl font-bold text-amber-600">{approvalRequired}</p>
                <p className="text-xs text-muted-foreground">Approbation requise</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Approbation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services?.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">{service.code}</TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      {service.system_modules ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{service.system_modules.name}</span>
                          <Badge variant="outline" className="w-fit text-xs">
                            {service.system_modules.platform}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {service.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {service.requires_approval ? (
                        <CheckCircle className="h-5 w-5 text-amber-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={service.is_active ? "default" : "secondary"}
                        className={service.is_active ? "bg-emerald-500" : ""}
                      >
                        {service.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
                {!services?.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      Aucun service trouvé. Créez-en un pour commencer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <ServiceEditorDialog service={editingService} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
