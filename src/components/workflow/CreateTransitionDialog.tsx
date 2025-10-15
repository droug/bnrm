import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  fromStepId?: string;
  onSaved?: () => void;
}

const TRIGGER_TYPES = [
  { value: 'manual', label: 'Manuel' },
  { value: 'automatic', label: 'Automatique' },
  { value: 'conditional', label: 'Conditionnel' },
  { value: 'scheduled', label: 'Planifié' },
];

export function CreateTransitionDialog({ 
  open, 
  onOpenChange, 
  workflowId, 
  fromStepId,
  onSaved 
}: CreateTransitionDialogProps) {
  const [transitionName, setTransitionName] = useState("");
  const [fromStep, setFromStep] = useState(fromStepId || "");
  const [toStep, setToStep] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [steps, setSteps] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && workflowId) {
      loadSteps();
    }
  }, [open, workflowId]);

  useEffect(() => {
    if (fromStepId) {
      setFromStep(fromStepId);
    }
  }, [fromStepId]);

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
    }
  };

  const handleSave = async () => {
    if (!transitionName.trim() || !workflowId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from('workflow_transitions').insert({
        workflow_id: workflowId,
        transition_name: transitionName.trim(),
        from_step_id: fromStep && fromStep !== "none" ? fromStep : null,
        to_step_id: toStep && toStep !== "none" ? toStep : null,
        trigger_type: triggerType,
      });

      if (error) throw error;

      toast.success("Transition créée avec succès");
      onOpenChange(false);
      resetForm();
      onSaved?.();
    } catch (error) {
      console.error('Error creating transition:', error);
      toast.error("Erreur lors de la création de la transition");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTransitionName("");
    setFromStep(fromStepId || "");
    setToStep("");
    setTriggerType("manual");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle Transition</DialogTitle>
          <DialogDescription>
            Créez une transition entre deux étapes du workflow
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transition-name">
              Nom de la transition <span className="text-destructive">*</span>
            </Label>
            <Input
              id="transition-name"
              value={transitionName}
              onChange={(e) => setTransitionName(e.target.value)}
              placeholder="Ex: Valider le document"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from-step">De l'étape</Label>
            <Select value={fromStep} onValueChange={setFromStep}>
              <SelectTrigger id="from-step">
                <SelectValue placeholder="Sélectionner une étape..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune (début du workflow)</SelectItem>
                {steps.map((step) => (
                  <SelectItem key={step.id} value={step.id}>
                    {step.step_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-step">À l'étape</Label>
            <Select value={toStep} onValueChange={setToStep}>
              <SelectTrigger id="to-step">
                <SelectValue placeholder="Sélectionner une étape..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune (fin du workflow)</SelectItem>
                {steps.map((step) => (
                  <SelectItem key={step.id} value={step.id}>
                    {step.step_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger-type">Type de déclenchement</Label>
            <Select value={triggerType} onValueChange={setTriggerType}>
              <SelectTrigger id="trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Création..." : "Créer la transition"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
