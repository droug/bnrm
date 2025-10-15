import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDropdown } from "@/components/ui/simple-dropdown";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateWorkflowDialog({ open, onOpenChange, onSuccess }: CreateWorkflowDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workflowType, setWorkflowType] = useState("");
  const [module, setModule] = useState("");
  const [loading, setLoading] = useState(false);

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
    { value: "ged", label: "GED" },
    { value: "payment", label: "E-Payment" },
    { value: "digital_library", label: "Bibliothèque Numérique" },
    { value: "portal", label: "Portail Web" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('workflow_definitions').insert({
        name,
        description,
        workflow_type: workflowType,
        module,
        version: 1,
        is_active: true,
        configuration: {},
      });

      if (error) throw error;

      toast.success("Workflow créé avec succès");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error("Erreur lors de la création du workflow");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setWorkflowType("");
    setModule("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau workflow</DialogTitle>
          <DialogDescription>
            Configurez les paramètres de votre nouveau workflow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du workflow *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow Dépôt Légal Standard"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description détaillée du workflow..."
              rows={3}
            />
          </div>

          <div>
            <Label>Type de workflow *</Label>
            <SimpleDropdown
              value={workflowType}
              onChange={setWorkflowType}
              options={workflowTypes}
              placeholder="Sélectionner le type"
            />
          </div>

          <div>
            <Label>Module *</Label>
            <SimpleDropdown
              value={module}
              onChange={setModule}
              options={modules}
              placeholder="Sélectionner le module"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !name || !workflowType || !module}>
              {loading ? "Création..." : "Créer le workflow"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
