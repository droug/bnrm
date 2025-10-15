import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Play } from "lucide-react";

interface WorkflowDefinition {
  id: string;
  name: string;
  workflow_type: string;
  module: string;
  description?: string;
}

interface StartWorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceId?: string;
  referenceType: string;
  module?: string;
  onWorkflowStarted?: () => void;
}

export function StartWorkflowDialog({
  open,
  onOpenChange,
  referenceId,
  referenceType,
  module,
  onWorkflowStarted,
}: StartWorkflowDialogProps) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadAvailableWorkflows();
    }
  }, [open, module, referenceType]);

  const loadAvailableWorkflows = async () => {
    try {
      let query = supabase
        .from('workflow_definitions')
        .select('*')
        .eq('is_active', true);

      if (module) {
        query = query.eq('module', module);
      }

      if (referenceType) {
        query = query.eq('workflow_type', referenceType);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error("Erreur lors du chargement des workflows");
    }
  };

  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) {
      toast.error("Veuillez sélectionner un workflow");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non connecté");

      // Créer l'instance de workflow
      const { data: instance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert([{
          workflow_id: selectedWorkflow,
          content_id: referenceId || crypto.randomUUID(),
          entity_type: referenceType,
          entity_id: referenceId,
          status: 'pending',
          started_by: user.id,
        }])
        .select()
        .single();

      if (instanceError) throw instanceError;

      toast.success("Workflow démarré avec succès");
      onOpenChange(false);
      onWorkflowStarted?.();
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error("Erreur lors du démarrage du workflow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Lancer un Workflow
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type de demande</Label>
            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {referenceType}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow">Sélectionner un workflow *</Label>
            <Select
              value={selectedWorkflow}
              onValueChange={setSelectedWorkflow}
            >
              <SelectTrigger id="workflow">
                <SelectValue placeholder="Choisir un workflow..." />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{workflow.name}</span>
                      {workflow.description && (
                        <span className="text-xs text-muted-foreground">
                          {workflow.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {workflows.length === 0 && (
            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded">
              Aucun workflow disponible pour ce type de demande
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={handleStartWorkflow} disabled={loading || !selectedWorkflow}>
            {loading ? "Démarrage..." : "Démarrer le workflow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}