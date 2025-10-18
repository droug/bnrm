import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SimpleRoleSelector } from "./SimpleRoleSelector";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    step_name: "",
    step_type: "approval",
    required_role: "",
    description: "",
  });

  useEffect(() => {
    loadSteps();
    loadRoles();
  }, [workflowId]);

  useEffect(() => {
    if (editingStep) {
      setFormData({
        step_name: editingStep.step_name,
        step_type: editingStep.step_type || "approval",
        required_role: editingStep.required_role || "",
        description: "",
      });
    } else {
      setFormData({
        step_name: "",
        step_type: "approval",
        required_role: "",
        description: "",
      });
    }
  }, [editingStep]);

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

  const handleOpenSheet = (step?: WorkflowStep) => {
    if (step) {
      setEditingStep(step);
    } else {
      setEditingStep(null);
    }
    setSheetOpen(true);
  };

  const handleSaveStep = async () => {
    if (!formData.step_name.trim()) {
      toast.error("Le nom de l'étape est requis");
      return;
    }

    setSaving(true);
    try {
      if (editingStep) {
        // Modifier une étape existante
        const { error } = await supabase
          .from('workflow_steps_new')
          .update({
            step_name: formData.step_name,
            step_type: formData.step_type,
            required_role: formData.required_role || null,
          })
          .eq('id', editingStep.id);

        if (error) throw error;
        toast.success("Étape modifiée avec succès");
      } else {
        // Créer une nouvelle étape
        const nextStepNumber = steps.length > 0 
          ? Math.max(...steps.map(s => s.step_number)) + 1 
          : 1;

        const { error } = await supabase
          .from('workflow_steps_new')
          .insert({
            workflow_id: workflowId,
            step_name: formData.step_name,
            step_number: nextStepNumber,
            step_type: formData.step_type,
            required_role: formData.required_role || null,
          });

        if (error) throw error;
        toast.success("Étape créée avec succès");
      }

      loadSteps();
      setSheetOpen(false);
      setEditingStep(null);
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
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
        <Button size="sm" onClick={() => handleOpenSheet()}>
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
                    onClick={() => handleOpenSheet(step)}
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingStep ? "Modifier l'étape" : "Nouvelle étape"}
            </SheetTitle>
            <SheetDescription>
              Configurez les paramètres de l'étape du workflow
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step_name">Nom de l'étape *</Label>
              <Input
                id="step_name"
                placeholder="Ex: Validation du document"
                value={formData.step_name}
                onChange={(e) =>
                  setFormData({ ...formData, step_name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="step_type">Type d'étape *</Label>
              <SimpleRoleSelector
                value={formData.step_type}
                onChange={(value) =>
                  setFormData({ ...formData, step_type: value })
                }
                roles={[
                  { id: "approval", role_name: "Approbation" },
                  { id: "review", role_name: "Révision" },
                  { id: "validation", role_name: "Validation" },
                  { id: "processing", role_name: "Traitement" },
                  { id: "notification", role_name: "Notification" },
                  { id: "decision", role_name: "Décision" },
                ]}
                placeholder="Sélectionner un type..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="required_role">Rôle requis</Label>
              <SimpleRoleSelector
                value={formData.required_role || ""}
                onChange={(value) =>
                  setFormData({ ...formData, required_role: value || null })
                }
                roles={roles.map(r => ({ id: r.role_name, role_name: r.role_name }))}
                placeholder="Aucun rôle spécifique"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de l'étape..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setSheetOpen(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveStep} disabled={saving}>
              {saving ? "Enregistrement..." : editingStep ? "Modifier" : "Créer"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

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