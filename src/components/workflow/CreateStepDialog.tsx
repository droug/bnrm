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
import { SimpleRoleSelector } from "./SimpleRoleSelector";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  onSaved?: () => void;
}

const STEP_TYPES = [
  { value: 'creation', label: 'Création' },
  { value: 'validation', label: 'Validation' },
  { value: 'correction', label: 'Correction' },
  { value: 'archivage', label: 'Archivage' },
  { value: 'notification', label: 'Notification' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'verification', label: 'Vérification qualité' },
];

export function CreateStepDialog({ open, onOpenChange, workflowId, onSaved }: CreateStepDialogProps) {
  const [stepName, setStepName] = useState("");
  const [stepType, setStepType] = useState("");
  const [requiredRole, setRequiredRole] = useState("");
  const [description, setDescription] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadRoles();
    }
  }, [open]);

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

  const handleSave = async () => {
    if (!stepName.trim() || !stepType || !workflowId) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);

      // Get next step number
      const { data: existingSteps } = await supabase
        .from('workflow_steps_new')
        .select('step_number')
        .eq('workflow_id', workflowId)
        .order('step_number', { ascending: false })
        .limit(1);

      const nextStepNumber = existingSteps && existingSteps.length > 0 
        ? existingSteps[0].step_number + 1 
        : 1;

      const { error } = await supabase.from('workflow_steps_new').insert({
        workflow_id: workflowId,
        step_name: stepName.trim(),
        step_type: stepType,
        step_number: nextStepNumber,
        required_role: requiredRole && requiredRole !== "none" ? requiredRole : null,
      });

      if (error) throw error;

      toast.success("Étape créée avec succès");
      onOpenChange(false);
      resetForm();
      onSaved?.();
    } catch (error) {
      console.error('Error creating step:', error);
      toast.error("Erreur lors de la création de l'étape");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStepName("");
    setStepType("");
    setRequiredRole("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle Étape</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle étape au workflow sélectionné
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="step-name">
              Nom de l'étape <span className="text-destructive">*</span>
            </Label>
            <Input
              id="step-name"
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              placeholder="Ex: Validation du document"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step-type">
              Type d'étape <span className="text-destructive">*</span>
            </Label>
            <SimpleRoleSelector
              value={stepType}
              onChange={setStepType}
              roles={STEP_TYPES.map(t => ({ id: t.value, role_name: t.label }))}
              placeholder="Sélectionner un type..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="required-role">Rôle requis</Label>
            <SimpleRoleSelector
              value={requiredRole}
              onChange={setRequiredRole}
              roles={[{ id: "none", role_name: "Aucun rôle spécifique" }, ...roles]}
              placeholder="Sélectionner un rôle..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de l'étape..."
              rows={3}
            />
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
              {saving ? "Création..." : "Créer l'étape"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
