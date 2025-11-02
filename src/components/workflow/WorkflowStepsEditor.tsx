import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SimpleRoleSelector } from "./SimpleRoleSelector";
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
import { Plus, Edit, Trash2, ArrowLeftRight, Save, X } from "lucide-react";
import { useWorkflowAutoSync } from "@/hooks/useWorkflowAutoSync";

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
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Auto-sync hook
  const { syncWorkflow, syncStatus, syncing } = useWorkflowAutoSync({
    workflowId,
    enabled: true
  });

  // Form state for each step
  const [formData, setFormData] = useState<Record<string, {
    step_name: string;
    step_type: string;
    required_role: string;
    description: string;
  }>>({});

  useEffect(() => {
    loadSteps();
    loadRoles();
  }, [workflowId]);

  useEffect(() => {
    // Initialize form data for all steps
    const initialFormData: Record<string, any> = {};
    steps.forEach(step => {
      initialFormData[step.id] = {
        step_name: step.step_name,
        step_type: step.step_type || "approval",
        required_role: step.required_role || "",
        description: "",
      };
    });
    // Add new step form
    initialFormData['new'] = {
      step_name: "",
      step_type: "approval",
      required_role: "",
      description: "",
    };
    setFormData(initialFormData);
  }, [steps]);

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

  const handleStartEdit = (stepId: string) => {
    setEditingStepId(stepId);
    setOpenAccordion(stepId);
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setOpenAccordion('new');
  };

  const handleCancelEdit = (stepId: string) => {
    if (stepId === 'new') {
      setIsCreatingNew(false);
      // Reset new form
      setFormData(prev => ({
        ...prev,
        new: {
          step_name: "",
          step_type: "approval",
          required_role: "",
          description: "",
        }
      }));
    } else {
      // Reset to original values
      const step = steps.find(s => s.id === stepId);
      if (step) {
        setFormData(prev => ({
          ...prev,
          [stepId]: {
            step_name: step.step_name,
            step_type: step.step_type || "approval",
            required_role: step.required_role || "",
            description: "",
          }
        }));
      }
    }
    setEditingStepId(null);
    setOpenAccordion("");
  };

  const handleSaveStep = async (stepId: string) => {
    const data = formData[stepId];
    if (!data?.step_name.trim()) {
      toast.error("Le nom de l'étape est requis");
      return;
    }

    setSaving(true);
    try {
      if (stepId === 'new') {
        // Créer une nouvelle étape
        const nextStepNumber = steps.length > 0 
          ? Math.max(...steps.map(s => s.step_number)) + 1 
          : 1;

        const { error } = await supabase
          .from('workflow_steps_new')
          .insert({
            workflow_id: workflowId,
            step_name: data.step_name,
            step_number: nextStepNumber,
            step_type: data.step_type,
            required_role: data.required_role || null,
          });

        if (error) throw error;
        toast.success("Étape créée avec succès");
        setIsCreatingNew(false);
      } else {
        // Modifier une étape existante
        const { error } = await supabase
          .from('workflow_steps_new')
          .update({
            step_name: data.step_name,
            step_type: data.step_type,
            required_role: data.required_role || null,
          })
          .eq('id', stepId);

        if (error) throw error;
        toast.success("Étape modifiée avec succès");
      }

      loadSteps();
      setEditingStepId(null);
      setOpenAccordion("");
      
      // Synchroniser automatiquement vers JSON
      await syncWorkflow(workflowId);
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
      
      // Synchroniser automatiquement vers JSON
      await syncWorkflow(workflowId);
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateFormField = (stepId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Étapes du Workflow</h3>
          {syncStatus.hasChanges && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <ArrowLeftRight className="h-3 w-3" />
              {syncStatus.changes.length} changement(s) détecté(s)
            </span>
          )}
        </div>
        <Button size="sm" onClick={handleStartCreate} disabled={isCreatingNew}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une étape
        </Button>
      </div>

      <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
        {/* New step accordion */}
        {isCreatingNew && (
          <AccordionItem value="new" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">Nouvelle étape</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-step_name">Nom de l'étape *</Label>
                  <Input
                    id="new-step_name"
                    placeholder="Ex: Validation du document"
                    value={formData['new']?.step_name || ""}
                    onChange={(e) => updateFormField('new', 'step_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-step_type">Type d'étape *</Label>
                  <SimpleRoleSelector
                    value={formData['new']?.step_type || "approval"}
                    onChange={(value) => updateFormField('new', 'step_type', value)}
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
                  <Label htmlFor="new-required_role">Rôle requis</Label>
                  <SimpleRoleSelector
                    value={formData['new']?.required_role || ""}
                    onChange={(value) => updateFormField('new', 'required_role', value || "")}
                    roles={roles.map(r => ({ id: r.role_name, role_name: r.role_name }))}
                    placeholder="Aucun rôle spécifique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-description">Description</Label>
                  <Textarea
                    id="new-description"
                    placeholder="Description de l'étape..."
                    value={formData['new']?.description || ""}
                    onChange={(e) => updateFormField('new', 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleSaveStep('new')} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Enregistrement..." : "Créer"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCancelEdit('new')} 
                    disabled={saving}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Existing steps */}
        {steps.map((step) => (
          <AccordionItem key={step.id} value={step.id} className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-muted-foreground">#{step.step_number}</span>
                  <span className="font-medium">{step.step_name}</span>
                  <span className="text-sm text-muted-foreground">({step.step_type || "-"})</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(step.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStepToDelete(step.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor={`${step.id}-step_name`}>Nom de l'étape *</Label>
                  <Input
                    id={`${step.id}-step_name`}
                    placeholder="Ex: Validation du document"
                    value={formData[step.id]?.step_name || ""}
                    onChange={(e) => updateFormField(step.id, 'step_name', e.target.value)}
                    disabled={editingStepId !== step.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${step.id}-step_type`}>Type d'étape *</Label>
                  <SimpleRoleSelector
                    value={formData[step.id]?.step_type || "approval"}
                    onChange={(value) => updateFormField(step.id, 'step_type', value)}
                    roles={[
                      { id: "approval", role_name: "Approbation" },
                      { id: "review", role_name: "Révision" },
                      { id: "validation", role_name: "Validation" },
                      { id: "processing", role_name: "Traitement" },
                      { id: "notification", role_name: "Notification" },
                      { id: "decision", role_name: "Décision" },
                    ]}
                    placeholder="Sélectionner un type..."
                    disabled={editingStepId !== step.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${step.id}-required_role`}>Rôle requis</Label>
                  <SimpleRoleSelector
                    value={formData[step.id]?.required_role || ""}
                    onChange={(value) => updateFormField(step.id, 'required_role', value || "")}
                    roles={roles.map(r => ({ id: r.role_name, role_name: r.role_name }))}
                    placeholder="Aucun rôle spécifique"
                    disabled={editingStepId !== step.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${step.id}-description`}>Description</Label>
                  <Textarea
                    id={`${step.id}-description`}
                    placeholder="Description de l'étape..."
                    value={formData[step.id]?.description || ""}
                    onChange={(e) => updateFormField(step.id, 'description', e.target.value)}
                    rows={3}
                    disabled={editingStepId !== step.id}
                  />
                </div>

                {editingStepId === step.id && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleSaveStep(step.id)} disabled={saving} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCancelEdit(step.id)} 
                      disabled={saving}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        {steps.length === 0 && !isCreatingNew && (
          <div className="text-center p-8 text-muted-foreground border rounded-lg">
            Aucune étape définie. Cliquez sur "Ajouter une étape" pour commencer.
          </div>
        )}
      </Accordion>

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