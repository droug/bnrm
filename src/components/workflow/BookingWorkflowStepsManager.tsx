import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
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

interface WorkflowStep {
  id: string;
  step_order: number;
  step_name: string;
  step_code: string;
  description: string;
  assigned_role: string;
  created_at: string;
}

interface EditingStep extends Partial<WorkflowStep> {
  isNew?: boolean;
}

export function BookingWorkflowStepsManager() {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStep, setEditingStep] = useState<EditingStep | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string>("");

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    try {
      const { data, error } = await supabase
        .from('booking_workflow_steps')
        .select('*')
        .order('step_order', { ascending: true });

      if (error) throw error;
      setSteps(data || []);
    } catch (error) {
      console.error('Error loading workflow steps:', error);
      toast.error("Erreur lors du chargement des étapes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.step_order)) : 0;
    setEditingStep({
      isNew: true,
      step_order: maxOrder + 1,
      step_name: "",
      step_code: "",
      description: "",
      assigned_role: "",
    });
  };

  const handleEdit = (step: WorkflowStep) => {
    setEditingStep({ ...step });
  };

  const handleSave = async () => {
    if (!editingStep) return;

    try {
      if (editingStep.isNew) {
        const { error } = await supabase
          .from('booking_workflow_steps')
          .insert({
            step_order: editingStep.step_order!,
            step_name: editingStep.step_name!,
            step_code: editingStep.step_code!,
            description: editingStep.description!,
            assigned_role: editingStep.assigned_role!,
          });

        if (error) throw error;
        toast.success("Étape ajoutée avec succès");
      } else {
        const { error } = await supabase
          .from('booking_workflow_steps')
          .update({
            step_order: editingStep.step_order!,
            step_name: editingStep.step_name!,
            step_code: editingStep.step_code!,
            description: editingStep.description!,
            assigned_role: editingStep.assigned_role!,
          })
          .eq('id', editingStep.id!);

        if (error) throw error;
        toast.success("Étape mise à jour avec succès");
      }

      setEditingStep(null);
      loadSteps();
    } catch (error) {
      console.error('Error saving step:', error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteClick = (stepId: string) => {
    setStepToDelete(stepId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from('booking_workflow_steps')
        .delete()
        .eq('id', stepToDelete);

      if (error) throw error;
      
      toast.success("Étape supprimée avec succès");
      loadSteps();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    try {
      const currentStep = steps[currentIndex];
      const targetStep = steps[targetIndex];

      // Swap step orders
      await supabase
        .from('booking_workflow_steps')
        .update({ step_order: targetStep.step_order })
        .eq('id', currentStep.id);

      await supabase
        .from('booking_workflow_steps')
        .update({ step_order: currentStep.step_order })
        .eq('id', targetStep.id);

      toast.success("Ordre modifié");
      loadSteps();
    } catch (error) {
      console.error('Error moving step:', error);
      toast.error("Erreur lors du déplacement");
    }
  };

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow des Réservations d'Espaces</h2>
          <p className="text-muted-foreground">
            Gestion des étapes du circuit de validation des réservations
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Étape
        </Button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <Card key={step.id}>
            {editingStep?.id === step.id ? (
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Ordre</label>
                      <Input
                        type="number"
                        value={editingStep.step_order}
                        onChange={(e) => setEditingStep({ ...editingStep, step_order: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Code</label>
                      <Input
                        value={editingStep.step_code}
                        onChange={(e) => setEditingStep({ ...editingStep, step_code: e.target.value })}
                        placeholder="e01_reception"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nom de l'étape</label>
                    <Input
                      value={editingStep.step_name}
                      onChange={(e) => setEditingStep({ ...editingStep, step_name: e.target.value })}
                      placeholder="Réception et validation initiale"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rôle assigné</label>
                    <Input
                      value={editingStep.assigned_role}
                      onChange={(e) => setEditingStep({ ...editingStep, assigned_role: e.target.value })}
                      placeholder="Secrétariat de Direction"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={editingStep.description}
                      onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                      placeholder="Description détaillée de l'étape"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                    <Button onClick={() => setEditingStep(null)} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge className="text-lg px-3 py-1">{step.step_order}</Badge>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.step_name}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {step.step_code}
                        </span>
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
                      <p className="text-sm text-foreground mt-1">
                        <span className="font-semibold">Rôle:</span> {step.assigned_role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveStep(step.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveStep(step.id, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(step)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(step.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            )}
          </Card>
        ))}

        {editingStep?.isNew && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ordre</label>
                    <Input
                      type="number"
                      value={editingStep.step_order}
                      onChange={(e) => setEditingStep({ ...editingStep, step_order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Code</label>
                    <Input
                      value={editingStep.step_code}
                      onChange={(e) => setEditingStep({ ...editingStep, step_code: e.target.value })}
                      placeholder="e09_nouvelle_etape"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Nom de l'étape</label>
                  <Input
                    value={editingStep.step_name}
                    onChange={(e) => setEditingStep({ ...editingStep, step_name: e.target.value })}
                    placeholder="Nom de la nouvelle étape"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rôle assigné</label>
                  <Input
                    value={editingStep.assigned_role}
                    onChange={(e) => setEditingStep({ ...editingStep, assigned_role: e.target.value })}
                    placeholder="Service responsable"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editingStep.description}
                    onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                    placeholder="Description détaillée de l'étape"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </Button>
                  <Button onClick={() => setEditingStep(null)} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {steps.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            Aucune étape définie. Créez-en une pour commencer.
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est irréversible.
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
