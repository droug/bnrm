import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ArrowRight } from "lucide-react";

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
  const [editingTransition, setEditingTransition] = useState<WorkflowTransition | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [workflowId]);

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

  const handleEditTransition = (transition: WorkflowTransition) => {
    setEditingTransition(transition);
    setSheetOpen(true);
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transitions du Workflow</h3>
        <Button size="sm" onClick={() => {
          setEditingTransition(null);
          setSheetOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une transition
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom de la transition</TableHead>
            <TableHead>De l'étape</TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>À l'étape</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transitions.map((transition) => (
            <TableRow key={transition.id}>
              <TableCell className="font-medium">{transition.transition_name}</TableCell>
              <TableCell>{getStepName(transition.from_step_id)}</TableCell>
              <TableCell>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell>{getStepName(transition.to_step_id)}</TableCell>
              <TableCell>
                {transition.trigger_type && (
                  <Badge variant="outline">{transition.trigger_type}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTransition(transition)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {transitions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Aucune transition définie
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingTransition ? "Modifier la transition" : "Nouvelle transition"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la transition</Label>
              <Input placeholder="Ex: Valider le document" />
            </div>
            <div className="space-y-2">
              <Label>De l'étape</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une étape" />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.step_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>À l'étape</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une étape" />
                </SelectTrigger>
                <SelectContent>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.step_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rôle responsable</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}