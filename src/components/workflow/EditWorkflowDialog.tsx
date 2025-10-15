import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDropdown } from "@/components/ui/simple-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  onSuccess: () => void;
}

interface WorkflowData {
  name: string;
  description: string;
  workflow_type: string;
  module: string;
}

export function EditWorkflowDialog({ open, onOpenChange, workflowId, onSuccess }: EditWorkflowDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkflowData>({
    name: "",
    description: "",
    workflow_type: "",
    module: ""
  });

  useEffect(() => {
    if (open && workflowId) {
      loadWorkflow();
    }
  }, [open, workflowId]);

  const loadWorkflow = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      
      setFormData({
        name: data.name,
        description: data.description || "",
        workflow_type: data.workflow_type,
        module: data.module
      });
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error("Erreur lors du chargement du workflow");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('workflow_definitions')
        .update({
          name: formData.name,
          description: formData.description,
          workflow_type: formData.workflow_type,
          module: formData.module,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (error) throw error;

      toast.success("Workflow modifié avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast.error("Erreur lors de la modification du workflow");
    } finally {
      setLoading(false);
    }
  };

  const workflowTypes = [
    { value: "legal_deposit", label: "Dépôt Légal" },
    { value: "cataloging", label: "Catalogage" },
    { value: "cbm", label: "CBM" },
    { value: "ged", label: "GED" },
    { value: "payment", label: "Paiement" },
    { value: "content", label: "Contenu" },
  ];

  const modules = [
    { value: "legal_deposit", label: "Dépôt Légal" },
    { value: "cataloging", label: "Catalogage" },
    { value: "cbm", label: "CBM" },
    { value: "digital_library", label: "Bibliothèque Numérique" },
    { value: "manuscripts", label: "Manuscrits" },
    { value: "reproduction", label: "Reproduction" },
    { value: "bnrm_services", label: "Services BNRM" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le Workflow</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom du Workflow</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Type de Workflow</Label>
            <SimpleDropdown
              options={workflowTypes}
              value={formData.workflow_type}
              onChange={(value) => setFormData({ ...formData, workflow_type: value })}
              placeholder="Sélectionner un type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-module">Module</Label>
            <SimpleDropdown
              options={modules}
              value={formData.module}
              onChange={(value) => setFormData({ ...formData, module: value })}
              placeholder="Sélectionner un module"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
