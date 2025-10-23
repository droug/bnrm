import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Clock, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WorkflowStep {
  id: string;
  step_number: number;
  step_name: string;
  step_type: string;
  required_role: string;
  action_type: string;
  deadline_hours: number;
}

interface StepExecution {
  id: string;
  step_id: string;
  step_number: number;
  step_name: string;
  status: string;
  assigned_to: string | null;
  started_at: string;
  completed_at: string | null;
  comments: string | null;
  action_taken: string | null;
  workflow_steps_new: WorkflowStep;
}

interface WorkflowInstance {
  id: string;
  instance_number: string;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface WorkflowTrackerProps {
  referenceId: string;
  referenceType: 'booking' | 'visit' | 'partnership' | 'program';
  onWorkflowUpdate?: () => void;
}

export function WorkflowTracker({ referenceId, referenceType, onWorkflowUpdate }: WorkflowTrackerProps) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [steps, setSteps] = useState<StepExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionComment, setActionComment] = useState("");
  const [processingStep, setProcessingStep] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, [referenceId]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);

      // Charger l'instance de workflow
      const { data: instanceData, error: instanceError } = await supabase
        .from('workflow_instances')
        .select('*')
        .eq('entity_type', referenceType)
        .eq('entity_id', referenceId)
        .maybeSingle();

      if (instanceError) throw instanceError;

      if (!instanceData) {
        // Pas encore de workflow créé
        setInstance(null);
        setSteps([]);
        setLoading(false);
        return;
      }

      setInstance(instanceData);

      // Charger les étapes du workflow
      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_step_executions')
        .select(`
          *,
          workflow_steps_new (*)
        `)
        .eq('workflow_instance_id', instanceData.id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData as any || []);
    } catch (error) {
      console.error('Error loading workflow:', error);
      toast.error("Erreur lors du chargement du workflow");
    } finally {
      setLoading(false);
    }
  };

  const startWorkflow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Récupérer la définition du workflow
      const { data: workflowDef, error: defError } = await supabase
        .from('workflow_definitions')
        .select('id')
        .eq('workflow_type', 'cultural_activities')
        .eq('is_active', true)
        .single();

      if (defError) throw defError;

      // Créer l'instance
      const { data: newInstance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: workflowDef.id,
          content_id: referenceId,
          entity_type: referenceType,
          entity_id: referenceId,
          started_by: user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Créer les exécutions d'étapes
      const { data: workflowSteps, error: stepsError } = await supabase
        .from('workflow_steps_new')
        .select('*')
        .eq('workflow_id', workflowDef.id)
        .order('step_number');

      if (stepsError) throw stepsError;

      const stepExecutions = workflowSteps.map((step, index) => ({
        workflow_instance_id: newInstance.id,
        step_id: step.id,
        step_number: step.step_number,
        step_name: step.step_name,
        status: index === 0 ? 'in_progress' : 'pending',
        started_at: index === 0 ? new Date().toISOString() : null
      }));

      const { error: executionsError } = await supabase
        .from('workflow_step_executions')
        .insert(stepExecutions);

      if (executionsError) throw executionsError;

      toast.success("Workflow démarré avec succès");
      await loadWorkflow();
      onWorkflowUpdate?.();
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error("Erreur lors du démarrage du workflow");
    }
  };

  const processStep = async (stepExecutionId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingStep(stepExecutionId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const newStatus = action === 'approve' ? 'completed' : 'rejected';

      // Mettre à jour l'étape
      const { error: updateError } = await supabase
        .from('workflow_step_executions')
        .update({
          status: newStatus,
          completed_at: new Date().toISOString(),
          comments: actionComment || null,
          assigned_to: user.id,
          action_taken: action === 'approve' ? 'approved' : 'rejected'
        })
        .eq('id', stepExecutionId);

      if (updateError) throw updateError;

      if (action === 'approve') {
        // Trouver la prochaine étape
        const currentStepIndex = steps.findIndex(s => s.id === stepExecutionId);
        if (currentStepIndex < steps.length - 1) {
          const nextStep = steps[currentStepIndex + 1];
          await supabase
            .from('workflow_step_executions')
            .update({
              status: 'in_progress',
              started_at: new Date().toISOString()
            })
            .eq('id', nextStep.id);
        } else {
          // Toutes les étapes sont terminées
          await supabase
            .from('workflow_instances')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', instance?.id);
        }
      } else {
        // Rejeter tout le workflow
        await supabase
          .from('workflow_instances')
          .update({
            status: 'rejected',
            completed_at: new Date().toISOString()
          })
          .eq('id', instance?.id);
      }

      toast.success(action === 'approve' ? "Étape validée" : "Étape rejetée");
      setActionComment("");
      await loadWorkflow();
      onWorkflowUpdate?.();
    } catch (error) {
      console.error('Error processing step:', error);
      toast.error("Erreur lors du traitement de l'étape");
    } finally {
      setProcessingStep(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "En attente", className: "bg-gray-500" },
      in_progress: { label: "En cours", className: "bg-blue-500" },
      completed: { label: "Terminé", className: "bg-green-500" },
      rejected: { label: "Rejeté", className: "bg-red-500" }
    };
    const { label, className } = config[status as keyof typeof config] || config.pending;
    return <Badge className={className}>{label}</Badge>;
  };

  if (loading) {
    return <div className="text-center p-4">Chargement du workflow...</div>;
  }

  if (!instance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow de validation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Aucun workflow n'a été démarré pour cette demande.
          </p>
          <Button onClick={startWorkflow}>
            Démarrer le workflow
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Circuit de validation</CardTitle>
          {getStatusBadge(instance.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          Instance: {instance.instance_number} • Démarré le{" "}
          {format(new Date(instance.started_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 h-full w-0.5 bg-border" />
              )}
              <div className="flex gap-4">
                <div className="flex-shrink-0 relative z-10">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">
                        Étape {step.workflow_steps_new.step_number}: {step.workflow_steps_new.step_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Rôle: {step.workflow_steps_new.required_role}
                      </p>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>

                  {step.started_at && (
                    <p className="text-xs text-muted-foreground">
                      Démarré: {format(new Date(step.started_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </p>
                  )}

                  {step.completed_at && (
                    <p className="text-xs text-muted-foreground">
                      Terminé: {format(new Date(step.completed_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                    </p>
                  )}

                  {step.comments && (
                    <p className="text-sm mt-2 p-2 bg-muted rounded">
                      Commentaires: {step.comments}
                    </p>
                  )}

                  {step.status === 'in_progress' && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Commentaires (optionnel)"
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => processStep(step.id, 'approve')}
                          disabled={processingStep === step.id}
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Valider
                        </Button>
                        <Button
                          onClick={() => processStep(step.id, 'reject')}
                          disabled={processingStep === step.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}