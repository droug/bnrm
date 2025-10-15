import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Edit, Trash2 } from "lucide-react";

interface WorkflowStep {
  id: string;
  step_name: string;
  step_number: number;
  step_type: string;
  required_role?: string;
}

interface WorkflowStepsEditorProps {
  workflowId: string;
}

export function WorkflowStepsEditor({ workflowId }: WorkflowStepsEditorProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadSteps();
    loadRoles();
  }, [workflowId]);

  const loadSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_steps_new')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error loading steps:', error);
      toast.error("Erreur lors du chargement des étapes");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_roles')
        .select('*')
        .order('role_name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleDeleteStep = async () => {
    if (!stepToDelete) return;

    try {
      const { error } = await supabase
        .from('workflow_steps_new')
        .delete()
        .eq('id', stepToDelete);

      if (error) throw error;

      toast.success("Étape supprimée");
      loadSteps();
      setDeleteDialogOpen(false);
      setStepToDelete(null);
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Étapes du Workflow</h3>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une étape
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Nom de l'étape</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Rôle requis</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow key={step.id}>
              <TableCell className="font-medium">{step.step_number}</TableCell>
              <TableCell>{step.step_name}</TableCell>
              <TableCell>{step.step_type || "-"}</TableCell>
              <TableCell>{step.required_role || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStep(step)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStepToDelete(step.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {steps.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucune étape définie
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}