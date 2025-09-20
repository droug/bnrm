import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Workflow, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MessageCircle,
  PlayCircle,
  PauseCircle,
  Archive,
  FileCheck,
  Shield,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkflowStep {
  name: string;
  description: string;
  required_role: string;
  auto_complete: boolean;
  validation_criteria: string[];
}

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  workflow_type: 'publication' | 'legal_deposit';
  steps: WorkflowStep[];
  is_active: boolean;
}

interface WorkflowInstance {
  id: string;
  workflow_id: string;
  content_id: string;
  current_step: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  started_by: string;
  started_at: string;
  completed_at?: string;
  metadata: any;
  workflows: WorkflowData;
  content: {
    title: string;
    content_type: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
  };
}

interface StepExecution {
  id: string;
  workflow_instance_id: string;
  step_number: number;
  step_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped';
  assigned_to?: string;
  started_at?: string;
  completed_at?: string;
  comments?: string;
  metadata: any;
}

interface ContentValidation {
  id: string;
  content_id: string;
  validation_type: 'editorial' | 'legal' | 'technical' | 'quality';
  validator_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  comments?: string;
  validation_criteria: any;
  validated_at?: string;
}

export default function WorkflowManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [stepExecutions, setStepExecutions] = useState<StepExecution[]>([]);
  const [contentValidations, setContentValidations] = useState<ContentValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [actionComments, setActionComments] = useState("");

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'librarian')) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_active', true);

      if (workflowsError) throw workflowsError;
      setWorkflows((workflowsData as any) || []);

      // Fetch workflow instances
      const { data: instancesData, error: instancesError } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          workflows (id, name, description, workflow_type, steps),
          content (title, content_type),
          profiles:started_by (first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;
      setWorkflowInstances((instancesData as any) || []);

      // Fetch step executions
      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_step_executions')
        .select('*')
        .order('step_number');

      if (stepsError) throw stepsError;
      setStepExecutions((stepsData as any) || []);

      // Fetch content validations
      const { data: validationsData, error: validationsError } = await supabase
        .from('content_validation')
        .select('*')
        .order('created_at', { ascending: false });

      if (validationsError) throw validationsError;
      setContentValidations((validationsData as any) || []);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des workflows",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startWorkflow = async (contentId: string, workflowType: 'publication' | 'legal_deposit') => {
    try {
      const workflow = workflows.find(w => w.workflow_type === workflowType);
      if (!workflow) {
        throw new Error(`Workflow ${workflowType} not found`);
      }

      // Create workflow instance
      const { data: instanceData, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert({
          workflow_id: workflow.id,
          content_id: contentId,
          started_by: user?.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Create step executions for all steps
      const stepExecutions = workflow.steps.map((step, index) => ({
        workflow_instance_id: instanceData.id,
        step_number: index,
        step_name: step.name,
        status: index === 0 ? 'pending' : 'pending',
        assigned_to: step.required_role === 'system' ? null : user?.id
      }));

      const { error: stepsError } = await supabase
        .from('workflow_step_executions')
        .insert(stepExecutions);

      if (stepsError) throw stepsError;

      toast({
        title: "Workflow démarré",
        description: `Le workflow ${workflow.name} a été démarré avec succès`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer le workflow",
        variant: "destructive",
      });
    }
  };

  const completeStep = async (stepExecutionId: string, status: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('workflow_step_executions')
        .update({
          status,
          completed_at: new Date().toISOString(),
          comments: actionComments
        })
        .eq('id', stepExecutionId);

      if (error) throw error;

      // If step is completed, check if workflow is complete
      const stepExecution = stepExecutions.find(s => s.id === stepExecutionId);
      if (stepExecution && status === 'completed') {
        const instanceSteps = stepExecutions.filter(s => s.workflow_instance_id === stepExecution.workflow_instance_id);
        const allCompleted = instanceSteps.every(s => s.id === stepExecutionId || s.status === 'completed');
        
        if (allCompleted) {
          await supabase
            .from('workflow_instances')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', stepExecution.workflow_instance_id);
        }
      }

      toast({
        title: "Étape mise à jour",
        description: `L'étape a été ${status === 'completed' ? 'complétée' : 'rejetée'}`,
      });

      setActionComments("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'étape",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'outline' as const, icon: Clock, label: 'En attente' },
      in_progress: { variant: 'secondary' as const, icon: PlayCircle, label: 'En cours' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Terminé' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejeté' },
      cancelled: { variant: 'outline' as const, icon: PauseCircle, label: 'Annulé' }
    };
    
    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getWorkflowTypeIcon = (type: string) => {
    return type === 'publication' ? FileCheck : Archive;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInstanceSteps = (instanceId: string) => {
    return stepExecutions.filter(s => s.workflow_instance_id === instanceId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Workflow className="h-6 w-6 text-primary" />
            Workflows de Publication et Dépôt Légal
          </h2>
          <p className="text-muted-foreground">
            Gestion des processus de validation et publication
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">En cours</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {workflowInstances.filter(w => w.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">En attente</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {workflowInstances.filter(w => w.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Terminés</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {workflowInstances.filter(w => w.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Rejetés</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {workflowInstances.filter(w => w.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des instances de workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Instances de Workflow Actives</CardTitle>
          <CardDescription>
            Suivi des processus de validation en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Type de Workflow</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Étape Actuelle</TableHead>
                  <TableHead>Démarré par</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowInstances.map((instance) => {
                  const WorkflowIcon = getWorkflowTypeIcon(instance.workflows.workflow_type);
                  const instanceSteps = getInstanceSteps(instance.id);
                  const currentStep = instanceSteps[instance.current_step];
                  
                  return (
                    <TableRow key={instance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{instance.content.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {instance.content.content_type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <WorkflowIcon className="h-4 w-4" />
                          {instance.workflows.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(instance.status)}
                      </TableCell>
                      <TableCell>
                        {currentStep ? (
                          <div>
                            <div className="font-medium">{currentStep.step_name}</div>
                            {getStatusBadge(currentStep.status)}
                          </div>
                        ) : (
                          'Terminé'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {instance.profiles.first_name} {instance.profiles.last_name}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(instance.started_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInstance(instance)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de détails d'instance */}
      {selectedInstance && (
        <AlertDialog open={!!selectedInstance} onOpenChange={() => setSelectedInstance(null)}>
          <AlertDialogContent className="max-w-4xl">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Détails du Workflow: {selectedInstance.workflows.name}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Contenu: {selectedInstance.content.title}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              {/* Progression des étapes */}
              <div className="space-y-2">
                <h4 className="font-medium">Progression des Étapes</h4>
                {getInstanceSteps(selectedInstance.id).map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{index + 1}. {step.step_name}</span>
                        {getStatusBadge(step.status)}
                      </div>
                      {step.comments && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <MessageCircle className="h-3 w-3 inline mr-1" />
                          {step.comments}
                        </div>
                      )}
                    </div>
                    
                    {step.status === 'pending' && (
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approuver
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Approuver l'étape</AlertDialogTitle>
                              <AlertDialogDescription>
                                Vous êtes sur le point d'approuver l'étape "{step.step_name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea
                              placeholder="Commentaires (optionnel)"
                              value={actionComments}
                              onChange={(e) => setActionComments(e.target.value)}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => completeStep(step.id, 'completed')}>
                                Approuver
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejeter
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Rejeter l'étape</AlertDialogTitle>
                              <AlertDialogDescription>
                                Vous êtes sur le point de rejeter l'étape "{step.step_name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Textarea
                              placeholder="Raison du rejet (obligatoire)"
                              value={actionComments}
                              onChange={(e) => setActionComments(e.target.value)}
                            />
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => completeStep(step.id, 'rejected')}
                                disabled={!actionComments.trim()}
                              >
                                Rejeter
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Fermer</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}