import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { CreateWorkflowDialog } from "./CreateWorkflowDialog";
import { EditWorkflowDialog } from "./EditWorkflowDialog";
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

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string | null;
  workflow_type: string;
  module: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export function WorkflowDefinitions() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string>("");

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error("Erreur lors du chargement des workflows");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflowStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_definitions')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Workflow ${!currentStatus ? 'activé' : 'désactivé'}`);
      loadWorkflows();
    } catch (error) {
      console.error('Error toggling workflow status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleEdit = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (workflowId: string) => {
    setWorkflowToDelete(workflowId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('workflow_definitions')
        .delete()
        .eq('id', workflowToDelete);

      if (error) throw error;
      
      toast.success("Workflow supprimé avec succès");
      loadWorkflows();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error("Erreur lors de la suppression du workflow");
    }
  };

  const getWorkflowTypeBadge = (type: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      legal_deposit: { color: "bg-blue-500", label: "Dépôt Légal" },
      cataloging: { color: "bg-purple-500", label: "Catalogage" },
      cbm: { color: "bg-green-500", label: "CBM" },
      ged: { color: "bg-orange-500", label: "GED" },
      payment: { color: "bg-yellow-500", label: "Paiement" },
      content: { color: "bg-pink-500", label: "Contenu" },
    };

    const badge = badges[type] || { color: "bg-gray-500", label: type };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Définitions de Workflows</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Workflow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className={!workflow.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {workflow.description || "Aucune description"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleWorkflowStatus(workflow.id, workflow.is_active)}
                >
                  {workflow.is_active ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-2">
                  {getWorkflowTypeBadge(workflow.workflow_type)}
                  <Badge variant="outline">v{workflow.version}</Badge>
                  {workflow.is_active && <Badge className="bg-green-500">Actif</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  Module: {workflow.module}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(workflow.id)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeleteClick(workflow.id)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {workflows.length === 0 && (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            Aucun workflow défini. Créez-en un pour commencer.
          </div>
        )}
      </div>

      <CreateWorkflowDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadWorkflows}
      />

      <EditWorkflowDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workflowId={selectedWorkflowId}
        onSuccess={loadWorkflows}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce workflow ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
