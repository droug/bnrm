import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { SimpleRoleSelector } from "./SimpleRoleSelector";
import { Input } from "@/components/ui/input";
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
import { Plus, Edit, Trash2, ArrowRight, Save, X } from "lucide-react";

interface WorkflowTransition {
  id: string;
  transition_name: string;
  from_step_id?: string;
  to_step_id?: string;
  condition_expression?: any;
  trigger_type?: string;
}

interface WorkflowTransitionsEditorProps {
  workflowId: string;
}

export function WorkflowTransitionsEditor({ workflowId }: WorkflowTransitionsEditorProps) {
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransitionId, setEditingTransitionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transitionToDelete, setTransitionToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form state for each transition
  const [formData, setFormData] = useState<Record<string, {
    transition_name: string;
    from_step_id: string;
    to_step_id: string;
    trigger_type: string;
  }>>({});

  useEffect(() => {
    loadData();
  }, [workflowId]);

  useEffect(() => {
    // Initialize form data for all transitions
    const initialFormData: Record<string, any> = {};
    transitions.forEach(transition => {
      initialFormData[transition.id] = {
        transition_name: transition.transition_name,
        from_step_id: transition.from_step_id || "",
        to_step_id: transition.to_step_id || "",
        trigger_type: transition.trigger_type || "",
      };
    });
    // Add new transition form
    initialFormData['new'] = {
      transition_name: "",
      from_step_id: "",
      to_step_id: "",
      trigger_type: "",
    };
    setFormData(initialFormData);
  }, [transitions]);

  const loadData = async () => {
    try {
      const [transitionsData, stepsData, rolesData] = await Promise.all([
        supabase.from('workflow_transitions').select('*').eq('workflow_id', workflowId),
        supabase.from('workflow_steps_new').select('*').eq('workflow_id', workflowId).order('step_number'),
        supabase.from('workflow_roles').select('*').order('role_name')
      ]);

      if (transitionsData.error) throw transitionsData.error;
      if (stepsData.error) throw stepsData.error;
      if (rolesData.error) throw rolesData.error;

      setTransitions(transitionsData.data || []);
      setSteps(stepsData.data || []);
      setRoles(rolesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const getStepName = (stepId: string | undefined) => {
    if (!stepId) return "-";
    const step = steps.find(s => s.id === stepId);
    return step ? step.step_name : "-";
  };

  const handleStartEdit = (transitionId: string) => {
    setEditingTransitionId(transitionId);
    setOpenAccordion(transitionId);
  };

  const handleStartCreate = () => {
    setIsCreatingNew(true);
    setOpenAccordion('new');
  };

  const handleCancelEdit = (transitionId: string) => {
    if (transitionId === 'new') {
      setIsCreatingNew(false);
      // Reset new form
      setFormData(prev => ({
        ...prev,
        new: {
          transition_name: "",
          from_step_id: "",
          to_step_id: "",
          trigger_type: "",
        }
      }));
    } else {
      // Reset to original values
      const transition = transitions.find(t => t.id === transitionId);
      if (transition) {
        setFormData(prev => ({
          ...prev,
          [transitionId]: {
            transition_name: transition.transition_name,
            from_step_id: transition.from_step_id || "",
            to_step_id: transition.to_step_id || "",
            trigger_type: transition.trigger_type || "",
          }
        }));
      }
    }
    setEditingTransitionId(null);
    setOpenAccordion("");
  };

  const handleSaveTransition = async (transitionId: string) => {
    const data = formData[transitionId];
    if (!data?.transition_name.trim()) {
      toast.error("Le nom de la transition est requis");
      return;
    }

    setSaving(true);
    try {
      if (transitionId === 'new') {
        // Créer une nouvelle transition
        const { error } = await supabase
          .from('workflow_transitions')
          .insert({
            workflow_id: workflowId,
            transition_name: data.transition_name,
            from_step_id: data.from_step_id || null,
            to_step_id: data.to_step_id || null,
            trigger_type: data.trigger_type || null,
          });

        if (error) throw error;
        toast.success("Transition créée avec succès");
        setIsCreatingNew(false);
      } else {
        // Modifier une transition existante
        const { error } = await supabase
          .from('workflow_transitions')
          .update({
            transition_name: data.transition_name,
            from_step_id: data.from_step_id || null,
            to_step_id: data.to_step_id || null,
            trigger_type: data.trigger_type || null,
          })
          .eq('id', transitionId);

        if (error) throw error;
        toast.success("Transition modifiée avec succès");
      }

      loadData();
      setEditingTransitionId(null);
      setOpenAccordion("");
    } catch (error) {
      console.error('Error saving transition:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransition = async () => {
    if (!transitionToDelete) return;

    try {
      const { error } = await supabase
        .from('workflow_transitions')
        .delete()
        .eq('id', transitionToDelete);

      if (error) throw error;

      toast.success("Transition supprimée");
      loadData();
      setDeleteDialogOpen(false);
      setTransitionToDelete(null);
    } catch (error) {
      console.error('Error deleting transition:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateFormField = (transitionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [transitionId]: {
        ...prev[transitionId],
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
        <h3 className="text-lg font-semibold">Transitions du Workflow</h3>
        <Button size="sm" onClick={handleStartCreate} disabled={isCreatingNew}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une transition
        </Button>
      </div>

      <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
        {/* New transition accordion */}
        {isCreatingNew && (
          <AccordionItem value="new" className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">Nouvelle transition</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-transition_name">Nom de la transition *</Label>
                  <Input
                    id="new-transition_name"
                    placeholder="Ex: Valider le document"
                    value={formData['new']?.transition_name || ""}
                    onChange={(e) => updateFormField('new', 'transition_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-from_step">De l'étape</Label>
                  <SimpleRoleSelector
                    value={formData['new']?.from_step_id || ""}
                    onChange={(value) => updateFormField('new', 'from_step_id', value)}
                    roles={steps.map(s => ({ id: s.id, role_name: s.step_name }))}
                    placeholder="Sélectionner une étape"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-to_step">À l'étape</Label>
                  <SimpleRoleSelector
                    value={formData['new']?.to_step_id || ""}
                    onChange={(value) => updateFormField('new', 'to_step_id', value)}
                    roles={steps.map(s => ({ id: s.id, role_name: s.step_name }))}
                    placeholder="Sélectionner une étape"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-trigger_type">Type de déclencheur</Label>
                  <SimpleRoleSelector
                    value={formData['new']?.trigger_type || ""}
                    onChange={(value) => updateFormField('new', 'trigger_type', value)}
                    roles={[
                      { id: "manual", role_name: "Manuel" },
                      { id: "automatic", role_name: "Automatique" },
                      { id: "conditional", role_name: "Conditionnel" },
                      { id: "timer", role_name: "Temporisé" },
                    ]}
                    placeholder="Sélectionner un type"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleSaveTransition('new')} disabled={saving} size="sm">
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

        {/* Existing transitions */}
        {transitions.map((transition) => (
          <AccordionItem key={transition.id} value={transition.id} className="border rounded-lg mb-2 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{transition.transition_name}</span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{getStepName(transition.from_step_id)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{getStepName(transition.to_step_id)}</span>
                  </div>
                  {transition.trigger_type && (
                    <Badge variant="outline">{transition.trigger_type}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartEdit(transition.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTransitionToDelete(transition.id);
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
                  <Label htmlFor={`${transition.id}-transition_name`}>Nom de la transition *</Label>
                  <Input
                    id={`${transition.id}-transition_name`}
                    placeholder="Ex: Valider le document"
                    value={formData[transition.id]?.transition_name || ""}
                    onChange={(e) => updateFormField(transition.id, 'transition_name', e.target.value)}
                    disabled={editingTransitionId !== transition.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${transition.id}-from_step`}>De l'étape</Label>
                  <SimpleRoleSelector
                    value={formData[transition.id]?.from_step_id || ""}
                    onChange={(value) => updateFormField(transition.id, 'from_step_id', value)}
                    roles={steps.map(s => ({ id: s.id, role_name: s.step_name }))}
                    placeholder="Sélectionner une étape"
                    disabled={editingTransitionId !== transition.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${transition.id}-to_step`}>À l'étape</Label>
                  <SimpleRoleSelector
                    value={formData[transition.id]?.to_step_id || ""}
                    onChange={(value) => updateFormField(transition.id, 'to_step_id', value)}
                    roles={steps.map(s => ({ id: s.id, role_name: s.step_name }))}
                    placeholder="Sélectionner une étape"
                    disabled={editingTransitionId !== transition.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${transition.id}-trigger_type`}>Type de déclencheur</Label>
                  <SimpleRoleSelector
                    value={formData[transition.id]?.trigger_type || ""}
                    onChange={(value) => updateFormField(transition.id, 'trigger_type', value)}
                    roles={[
                      { id: "manual", role_name: "Manuel" },
                      { id: "automatic", role_name: "Automatique" },
                      { id: "conditional", role_name: "Conditionnel" },
                      { id: "timer", role_name: "Temporisé" },
                    ]}
                    placeholder="Sélectionner un type"
                    disabled={editingTransitionId !== transition.id}
                  />
                </div>

                {editingTransitionId === transition.id && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleSaveTransition(transition.id)} disabled={saving} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleCancelEdit(transition.id)} 
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

        {transitions.length === 0 && !isCreatingNew && (
          <div className="text-center p-8 text-muted-foreground border rounded-lg">
            Aucune transition définie. Cliquez sur "Ajouter une transition" pour commencer.
          </div>
        )}
      </Accordion>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette transition ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransition}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}