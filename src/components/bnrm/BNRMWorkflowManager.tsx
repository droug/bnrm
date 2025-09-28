import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Settings, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Users,
  Bell,
  Eye,
  Save,
  X,
  Calendar,
  Hash,
  Archive
} from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  role_required: string;
  estimated_duration_hours: number;
  is_mandatory: boolean;
  order_index: number;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  workflow_type: string;
  description: string;
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WorkflowInstance {
  id: string;
  workflow_id: string;
  content_id: string;
  status: string;
  current_step: number;
  started_by: string;
  started_at: string;
  completed_at?: string;
  metadata: any;
}

// Validation schemas
const workflowSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  workflow_type: z.string().min(1, "Le type est requis"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  is_active: z.boolean().default(true)
});

const stepSchema = z.object({
  name: z.string().min(3, "Le nom de l'étape est requis"),
  description: z.string().min(5, "La description est requise"),
  role_required: z.string().min(1, "Le rôle est requis"),
  estimated_duration_hours: z.number().min(0.5, "La durée minimum est 0.5h").max(168, "Maximum 168h"),
  is_mandatory: z.boolean().default(true),
  order_index: z.number().min(1, "L'ordre doit être supérieur à 0")
});

const assignmentSchema = z.object({
  step_execution_id: z.string().min(1, "ID de l'étape requis"),
  assigned_to: z.string().min(1, "Utilisateur requis"),
  comments: z.string().optional()
});

const startWorkflowSchema = z.object({
  workflow_id: z.string().min(1, "Workflow requis"),
  publication_title: z.string().min(3, "Titre de la publication requis"),
  publisher_name: z.string().min(3, "Nom de l'éditeur requis"),
  publication_type: z.string().min(1, "Type de publication requis"),
  submission_date: z.date({ required_error: "Date de soumission requise" }),
  expected_completion: z.date({ required_error: "Date prévue requise" }),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  special_instructions: z.string().optional(),
  auto_assign: z.boolean().default(true),
  notify_submitter: z.boolean().default(true)
});

type WorkflowFormData = z.infer<typeof workflowSchema>;
type StepFormData = z.infer<typeof stepSchema>;
type AssignmentFormData = z.infer<typeof assignmentSchema>;
type StartWorkflowFormData = z.infer<typeof startWorkflowSchema>;

interface StepExecution {
  id: string;
  workflow_instance_id: string;
  step_number: number;
  step_name: string;
  status: string;
  assigned_to?: string;
  started_at?: string;
  completed_at?: string;
  comments?: string;
  metadata: any;
}

export function BNRMWorkflowManager() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [stepExecutions, setStepExecutions] = useState<StepExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);
  const [selectedStepExecution, setSelectedStepExecution] = useState<StepExecution | null>(null);
  const [selectedWorkflowForStart, setSelectedWorkflowForStart] = useState<WorkflowDefinition | null>(null);
  
  // Confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  
  const { toast } = useToast();

  // Forms
  const workflowForm = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      workflow_type: "legal_deposit",
      description: "",
      is_active: true
    }
  });

  const assignmentForm = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      step_execution_id: "",
      assigned_to: "",
      comments: ""
    }
  });

  const startWorkflowForm = useForm<StartWorkflowFormData>({
    resolver: zodResolver(startWorkflowSchema),
    defaultValues: {
      workflow_id: "",
      publication_title: "",
      publisher_name: "",
      publication_type: "book",
      priority: "normal",
      auto_assign: true,
      notify_submitter: true
    }
  });

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    try {
      setLoading(true);

      // Load workflow definitions
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (workflowError) throw workflowError;

      // Load workflow instances
      const { data: instanceData, error: instanceError } = await supabase
        .from('workflow_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (instanceError) throw instanceError;

      // Load step executions
      const { data: stepData, error: stepError } = await supabase
        .from('workflow_step_executions')
        .select('*')
        .order('created_at', { ascending: false });

      if (stepError) throw stepError;

      setWorkflows((workflowData || []).map(w => ({
        ...w,
        steps: Array.isArray(w.steps) ? w.steps as unknown as WorkflowStep[] : []
      })));
      setInstances(instanceData || []);
      setStepExecutions(stepData || []);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultWorkflow = async () => {
    try {
      const defaultWorkflow = {
        name: "Workflow Dépôt Légal Standard",
        workflow_type: "legal_deposit",
        description: "Processus standard de traitement des dépôts légaux conforme au CPS",
        is_active: true,
        steps: [
          {
            id: "step-1",
            name: "Réception et Enregistrement",
            description: "Réception de la demande et vérification des informations de base",
            role_required: "agent_dl",
            estimated_duration_hours: 2,
            is_mandatory: true,
            order_index: 1
          },
          {
            id: "step-2", 
            name: "Vérification Documents",
            description: "Contrôle de conformité des documents fournis",
            role_required: "validateur",
            estimated_duration_hours: 4,
            is_mandatory: true,
            order_index: 2
          },
          {
            id: "step-3",
            name: "Attribution Numéros",
            description: "Attribution des numéros ISBN/ISSN/DL selon le type",
            role_required: "agent_isbn",
            estimated_duration_hours: 1,
            is_mandatory: true,
            order_index: 3
          },
          {
            id: "step-4",
            name: "Contrôle Qualité",
            description: "Vérification finale de la conformité avant archivage",
            role_required: "agent_dl",
            estimated_duration_hours: 2,
            is_mandatory: true,
            order_index: 4
          },
          {
            id: "step-5",
            name: "Archivage et Finalisation",
            description: "Archivage définitif et génération des documents finaux",
            role_required: "conservateur",
            estimated_duration_hours: 1,
            is_mandatory: true,
            order_index: 5
          }
        ]
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert([defaultWorkflow])
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Workflow par défaut créé avec succès",
      });

      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startWorkflowInstance = async (data: StartWorkflowFormData) => {
    try {
      const workflow = workflows.find(w => w.id === data.workflow_id);
      if (!workflow) {
        throw new Error("Workflow non trouvé");
      }

      // Create content record first (simulating legal deposit content)
      const contentId = `content-${Date.now()}`;
      
      // Create workflow instance with comprehensive metadata
      const instanceMetadata = {
        workflow_name: workflow.name,
        publication_details: {
          title: data.publication_title,
          publisher: data.publisher_name,
          type: data.publication_type,
          submission_date: data.submission_date.toISOString(),
          expected_completion: data.expected_completion.toISOString()
        },
        processing_options: {
          priority: data.priority,
          auto_assign: data.auto_assign,
          notify_submitter: data.notify_submitter,
          special_instructions: data.special_instructions
        },
        cps_compliance: {
          legal_deposit_number: `DL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          submission_timestamp: new Date().toISOString(),
          regulatory_requirements: ["document_verification", "metadata_validation", "archival_compliance"]
        }
      };

      const { data: instance, error: instanceError } = await supabase
        .from('workflow_instances')
        .insert([{
          workflow_id: data.workflow_id,
          content_id: contentId,
          status: 'active',
          current_step: 1,
          started_by: 'current_user_id', // Replace with actual user ID
          metadata: instanceMetadata
        }])
        .select()
        .single();

      if (instanceError) throw instanceError;

      // Create step executions for all workflow steps with proper CPS transitions
      const stepExecutions = workflow.steps.map((step, index) => {
        const isFirstStep = index === 0;
        const stepMetadata = {
          role_required: step.role_required,
          estimated_duration_hours: step.estimated_duration_hours,
          is_mandatory: step.is_mandatory,
          cps_requirements: getCPSRequirementsForStep(step.name),
          auto_assignment_rules: data.auto_assign ? getAutoAssignmentRules(step.role_required) : null
        };

        return {
          workflow_instance_id: instance.id,
          step_number: step.order_index,
          step_name: step.name,
          status: isFirstStep ? 'active' : 'pending',
          assigned_to: data.auto_assign && isFirstStep ? getDefaultAssigneeForRole(step.role_required) : null,
          started_at: isFirstStep ? new Date().toISOString() : null,
          metadata: stepMetadata
        };
      });

      const { error: stepsError } = await supabase
        .from('workflow_step_executions')
        .insert(stepExecutions);

      if (stepsError) throw stepsError;

      // Send notifications if enabled
      if (data.notify_submitter) {
        await sendWorkflowNotification(instance.id, 'workflow_started', data.publisher_name);
      }

      // Log workflow initiation for audit trail
      await logWorkflowActivity(instance.id, 'workflow_initiated', {
        initiated_by: 'current_user_id',
        publication_title: data.publication_title,
        priority: data.priority,
        estimated_completion: data.expected_completion
      });

      toast({
        title: "Workflow démarré avec succès",
        description: `Instance ${instance.id.slice(0, 8)} créée pour "${data.publication_title}"`,
      });

      setShowStartDialog(false);
      startWorkflowForm.reset();
      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper functions for CPS compliance
  const getCPSRequirementsForStep = (stepName: string) => {
    const requirements = {
      "Réception et Enregistrement": [
        "verify_publisher_credentials",
        "validate_submission_format",
        "generate_deposit_number",
        "record_submission_timestamp"
      ],
      "Vérification Documents": [
        "check_document_completeness",
        "validate_metadata_accuracy",
        "verify_legal_compliance",
        "assess_publication_quality"
      ],
      "Attribution Numéros": [
        "determine_identifier_type",
        "assign_isbn_issn_number",
        "update_national_registry",
        "generate_official_certificate"
      ],
      "Contrôle Qualité": [
        "final_document_review",
        "compliance_verification",
        "digital_preservation_check",
        "metadata_completeness_review"
      ],
      "Archivage et Finalisation": [
        "permanent_archival_storage",
        "catalog_entry_creation",
        "access_permissions_setup",
        "completion_notification"
      ]
    };
    return requirements[stepName] || [];
  };

  const getAutoAssignmentRules = (role: string) => {
    const rules = {
      "agent_dl": ["workload_balance", "expertise_match", "availability_check"],
      "validateur": ["specialization_match", "quality_rating", "current_capacity"],
      "agent_isbn": ["identifier_expertise", "publisher_history", "workload_status"],
      "conservateur": ["archival_expertise", "preservation_knowledge", "final_review_authority"]
    };
    return rules[role] || [];
  };

  const getDefaultAssigneeForRole = (role: string) => {
    const assignments = {
      "agent_dl": "user1",
      "validateur": "user2", 
      "agent_isbn": "user3",
      "conservateur": "user4"
    };
    return assignments[role] || null;
  };

  const sendWorkflowNotification = async (instanceId: string, type: string, recipient: string) => {
    // This would integrate with your notification system
    console.log(`Notification sent: ${type} for instance ${instanceId} to ${recipient}`);
  };

  const logWorkflowActivity = async (instanceId: string, action: string, details: any) => {
    // This would log to your audit system
    console.log(`Workflow activity logged: ${action} for ${instanceId}`, details);
  };

  const openStartDialog = (workflow: WorkflowDefinition) => {
    setSelectedWorkflowForStart(workflow);
    startWorkflowForm.setValue('workflow_id', workflow.id);
    setShowStartDialog(true);
  };

  const createWorkflow = async (data: WorkflowFormData) => {
    try {
      const workflowData = {
        name: data.name,
        workflow_type: data.workflow_type,
        description: data.description,
        is_active: data.is_active,
        steps: [] as any // Will be added later via step management
      };

      const { error } = await supabase
        .from('workflows')
        .insert([workflowData]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Workflow créé avec succès",
      });

      setShowCreateDialog(false);
      workflowForm.reset();
      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Confirmation handlers
  const confirmDeleteWorkflow = (workflow: WorkflowDefinition) => {
    setPendingAction({ type: 'delete', workflow });
    setShowDeleteConfirm(true);
  };

  const confirmToggleWorkflow = (workflow: WorkflowDefinition) => {
    setPendingAction({ type: 'toggle', workflow });
    setShowToggleConfirm(true);
  };

  const confirmCompleteStep = (stepId: string, status: string) => {
    setPendingAction({ type: 'complete', stepId, status });
    if (status === 'completed') {
      setShowCompleteConfirm(true);
    } else {
      setShowRejectConfirm(true);
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingAction) return;

    try {
      switch (pendingAction.type) {
        case 'delete':
          await deleteWorkflow(pendingAction.workflow.id);
          break;
        case 'toggle':
          await toggleWorkflowStatus(pendingAction.workflow.id, !pendingAction.workflow.is_active);
          break;
        case 'complete':
          await completeStep(pendingAction.stepId, pendingAction.status);
          break;
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
      setShowDeleteConfirm(false);
      setShowToggleConfirm(false);
      setShowCompleteConfirm(false);
      setShowRejectConfirm(false);
    }
  };

  const updateWorkflow = async (workflowId: string, data: Partial<WorkflowFormData>) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update(data)
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Workflow mis à jour avec succès",
      });

      setShowEditDialog(false);
      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Workflow supprimé avec succès",
      });

      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleWorkflowStatus = async (workflowId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: isActive })
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Workflow ${isActive ? 'activé' : 'désactivé'} avec succès`,
      });

      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const assignStepToUser = async (data: AssignmentFormData) => {
    try {
      const { error } = await supabase
        .from('workflow_step_executions')
        .update({
          assigned_to: data.assigned_to,
          comments: data.comments,
          status: 'active'
        })
        .eq('id', data.step_execution_id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Étape assignée avec succès",
      });

      setShowAssignDialog(false);
      assignmentForm.reset();
      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const completeStep = async (stepExecutionId: string, status: 'completed' | 'rejected', comments?: string) => {
    try {
      // Update step execution
      const { error: updateError } = await supabase
        .from('workflow_step_executions')
        .update({
          status,
          completed_at: new Date().toISOString(),
          comments
        })
        .eq('id', stepExecutionId);

      if (updateError) throw updateError;

      // If step completed, advance workflow
      if (status === 'completed') {
        const stepExecution = stepExecutions.find(s => s.id === stepExecutionId);
        if (stepExecution) {
          const instance = instances.find(i => i.id === stepExecution.workflow_instance_id);
          if (instance) {
            const nextStepNumber = stepExecution.step_number + 1;
            const workflow = workflows.find(w => w.id === instance.workflow_id);
            
            if (workflow && nextStepNumber <= workflow.steps.length) {
              // Activate next step
              await supabase
                .from('workflow_step_executions')
                .update({ status: 'active', started_at: new Date().toISOString() })
                .eq('workflow_instance_id', instance.id)
                .eq('step_number', nextStepNumber);

              // Update instance current step
              await supabase
                .from('workflow_instances')
                .update({ current_step: nextStepNumber })
                .eq('id', instance.id);
            } else {
              // Complete workflow
              await supabase
                .from('workflow_instances')
                .update({ 
                  status: 'completed',
                  completed_at: new Date().toISOString()
                })
                .eq('id', instance.id);
            }
          }
        }
      }

      toast({
        title: "Succès",
        description: `Étape ${status === 'completed' ? 'complétée' : 'rejetée'}`,
      });

      setShowDetailsDialog(false);
      loadWorkflowData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (stepExecution: StepExecution) => {
    setSelectedStepExecution(stepExecution);
    assignmentForm.setValue('step_execution_id', stepExecution.id);
    setShowAssignDialog(true);
  };

  const openDetailsDialog = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setShowDetailsDialog(true);
  };

  const openEditDialog = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow);
    workflowForm.setValue('name', workflow.name);
    workflowForm.setValue('workflow_type', workflow.workflow_type);
    workflowForm.setValue('description', workflow.description);
    workflowForm.setValue('is_active', workflow.is_active);
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': { variant: "secondary" as const, icon: Clock, label: "En attente", className: "" },
      'active': { variant: "default" as const, icon: Play, label: "En cours", className: "" },
      'completed': { variant: "default" as const, icon: CheckCircle, label: "Terminé", className: "bg-green-100 text-green-800" },
      'rejected': { variant: "destructive" as const, icon: XCircle, label: "Rejeté", className: "" },
      'paused': { variant: "secondary" as const, icon: Pause, label: "En pause", className: "" }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getInstanceSteps = (instanceId: string) => {
    return stepExecutions.filter(step => step.workflow_instance_id === instanceId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Workflows</h2>
          <p className="text-muted-foreground">
            Configuration et suivi des processus de dépôt légal
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={createDefaultWorkflow} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Workflow par défaut
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau workflow</DialogTitle>
                <DialogDescription>
                  Définir un nouveau processus de traitement pour le dépôt légal
                </DialogDescription>
              </DialogHeader>
              <Form {...workflowForm}>
                <form onSubmit={workflowForm.handleSubmit(createWorkflow)} className="space-y-4">
                  <FormField
                    control={workflowForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du workflow</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Workflow Dépôt Légal Standard" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={workflowForm.control}
                    name="workflow_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de workflow</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border z-50">
                            <SelectItem value="legal_deposit">Dépôt Légal</SelectItem>
                            <SelectItem value="publication">Publication</SelectItem>
                            <SelectItem value="validation">Validation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workflowForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description détaillée du processus..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workflowForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Actif</FormLabel>
                          <FormDescription>
                            Le workflow sera disponible pour de nouvelles instances
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Créer
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows Actifs</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.filter(w => w.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instances en Cours</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances.filter(i => i.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étapes En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stepExecutions.filter(s => s.status === 'pending').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complétés ce mois</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances.filter(i => i.status === 'completed').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="definitions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="definitions">Définitions</TabsTrigger>
          <TabsTrigger value="instances">Instances Actives</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Workflow Definitions */}
        <TabsContent value="definitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflows Configurés</CardTitle>
              <CardDescription>
                Gestion des modèles de processus pour le dépôt légal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{workflow.name}</h3>
                        {getStatusBadge(workflow.is_active ? 'active' : 'paused')}
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openStartDialog(workflow)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Démarrer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(workflow)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmToggleWorkflow(workflow)}
                        >
                          {workflow.is_active ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                          {workflow.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmDeleteWorkflow(workflow)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>{workflow.steps.length} étapes</span>
                      <span>Type: {workflow.workflow_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Instances */}
        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instances de Workflow en Cours</CardTitle>
              <CardDescription>
                Suivi en temps réel des processus actifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Instance</th>
                      <th className="text-left p-2">Workflow</th>
                      <th className="text-left p-2">Étape Actuelle</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Démarré</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.map((instance) => {
                      const workflow = workflows.find(w => w.id === instance.workflow_id);
                      const currentSteps = getInstanceSteps(instance.id);
                      const activeStep = currentSteps.find(s => s.status === 'active');
                      
                      return (
                        <tr key={instance.id} className="border-b">
                          <td className="p-2">{instance.id.slice(0, 8)}...</td>
                          <td className="p-2">{workflow?.name || 'N/A'}</td>
                          <td className="p-2">
                            {activeStep ? `${activeStep.step_number}. ${activeStep.step_name}` : 'N/A'}
                          </td>
                          <td className="p-2">{getStatusBadge(instance.status)}</td>
                          <td className="p-2">{new Date(instance.started_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openDetailsDialog(instance)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                              {activeStep && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openAssignDialog(activeStep)}
                                >
                                  <Users className="h-4 w-4 mr-1" />
                                  Assigner
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance des Workflows</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Délai moyen de traitement</span>
                    <span className="font-semibold">2.3 jours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de completion</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Workflows en retard</span>
                    <span className="font-semibold text-red-600">3</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAlertsDialog(true)}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Configurer Alertes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Alertes et Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>3 étapes dépassent le délai prévu</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>2 validateurs non assignés</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span>15 documents en attente de validation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Workflow Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le workflow</DialogTitle>
            <DialogDescription>
              Mettre à jour les paramètres du workflow
            </DialogDescription>
          </DialogHeader>
          <Form {...workflowForm}>
            <form onSubmit={workflowForm.handleSubmit((data) => {
              if (selectedWorkflow) {
                updateWorkflow(selectedWorkflow.id, data);
              }
            })} className="space-y-4">
              <FormField
                control={workflowForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du workflow</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={workflowForm.control}
                name="workflow_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de workflow</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="legal_deposit">Dépôt Légal</SelectItem>
                        <SelectItem value="publication">Publication</SelectItem>
                        <SelectItem value="validation">Validation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={workflowForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={workflowForm.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actif</FormLabel>
                      <FormDescription>
                        Le workflow sera disponible pour de nouvelles instances
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Sauvegarder
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Assigner une étape</DialogTitle>
            <DialogDescription>
              Assigner cette étape à un utilisateur responsable
            </DialogDescription>
          </DialogHeader>
          <Form {...assignmentForm}>
            <form onSubmit={assignmentForm.handleSubmit(assignStepToUser)} className="space-y-4">
              <FormField
                control={assignmentForm.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utilisateur responsable</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Sélectionner un utilisateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="user1">M. Alami (Agent DL)</SelectItem>
                        <SelectItem value="user2">Mme. Bennani (Validateur)</SelectItem>
                        <SelectItem value="user3">M. Hajjami (Agent ISBN)</SelectItem>
                        <SelectItem value="user4">Mme. Tazi (Conservateur)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={assignmentForm.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentaires (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions ou commentaires pour l'assigné..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Assigner
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Instance Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'instance de workflow</DialogTitle>
            <DialogDescription>
              Suivi détaillé et actions sur les étapes du workflow
            </DialogDescription>
          </DialogHeader>
          {selectedInstance && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">ID Instance</Label>
                  <p className="text-sm text-muted-foreground">{selectedInstance.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <div className="mt-1">{getStatusBadge(selectedInstance.status)}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Étapes du workflow</Label>
                {getInstanceSteps(selectedInstance.id).map((step) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{step.step_number}. {step.step_name}</h4>
                      {getStatusBadge(step.status)}
                    </div>
                    {step.assigned_to && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Assigné à: {step.assigned_to}
                      </p>
                    )}
                    {step.comments && (
                      <p className="text-sm bg-muted p-2 rounded">
                        {step.comments}
                      </p>
                    )}
                    {step.status === 'active' && (
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          onClick={() => confirmCompleteStep(step.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => confirmCompleteStep(step.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAssignDialog(step)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Réassigner
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alerts Configuration Dialog */}
      <Dialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Configuration des Alertes</DialogTitle>
            <DialogDescription>
              Paramétrer les notifications et alertes du système
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Alerte délai dépassé</Label>
                <p className="text-sm text-muted-foreground">
                  Notifier quand une étape dépasse le délai prévu
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Rappel assignation</Label>
                <p className="text-sm text-muted-foreground">
                  Rappeler aux utilisateurs leurs tâches en attente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Rapport quotidien</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer un résumé quotidien des activités
                </p>
              </div>
              <Switch />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>
                Annuler
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Succès",
                  description: "Configuration des alertes sauvegardée",
                });
                setShowAlertsDialog(false);
              }}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Start Workflow Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="max-w-3xl bg-background max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Démarrer un nouveau workflow</DialogTitle>
            <DialogDescription>
              Initier le processus de dépôt légal pour une nouvelle publication
            </DialogDescription>
          </DialogHeader>
          <Form {...startWorkflowForm}>
            <form onSubmit={startWorkflowForm.handleSubmit(startWorkflowInstance)} className="space-y-6">
              {/* Publication Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Informations sur la Publication
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={startWorkflowForm.control}
                    name="publication_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de la publication</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Guide pratique du développement web" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={startWorkflowForm.control}
                    name="publisher_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'éditeur</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Éditions TechMaroc" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={startWorkflowForm.control}
                  name="publication_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de publication</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="book">Livre</SelectItem>
                          <SelectItem value="periodical">Périodique</SelectItem>
                          <SelectItem value="thesis">Thèse</SelectItem>
                          <SelectItem value="report">Rapport</SelectItem>
                          <SelectItem value="multimedia">Multimédia</SelectItem>
                          <SelectItem value="digital">Publication numérique</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Processing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Paramètres de Traitement
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={startWorkflowForm.control}
                    name="submission_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de soumission</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={startWorkflowForm.control}
                    name="expected_completion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de finalisation prévue</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={startWorkflowForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité de traitement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border z-50">
                          <SelectItem value="low">Basse - Traitement standard (7-10 jours)</SelectItem>
                          <SelectItem value="normal">Normale - Traitement régulier (3-5 jours)</SelectItem>
                          <SelectItem value="high">Haute - Traitement prioritaire (1-2 jours)</SelectItem>
                          <SelectItem value="urgent">Urgente - Traitement immédiat (24h)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Workflow Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Options de Workflow
                </h3>
                
                <div className="space-y-4">
                  <FormField
                    control={startWorkflowForm.control}
                    name="auto_assign"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Assignation automatique</FormLabel>
                          <FormDescription>
                            Assigner automatiquement les étapes aux utilisateurs disponibles selon leurs rôles
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={startWorkflowForm.control}
                    name="notify_submitter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Notifier le déposant</FormLabel>
                          <FormDescription>
                            Envoyer des notifications automatiques sur l'avancement du traitement
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={startWorkflowForm.control}
                  name="special_instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions spéciales (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Instructions particulières pour le traitement de cette publication..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Précisions sur les exigences particulières, délais spéciaux, ou considérations techniques
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Workflow Steps Preview */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Aperçu des étapes du workflow
                </h4>
                {selectedWorkflowForStart && (
                  <div className="space-y-3">
                    {selectedWorkflowForStart.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground truncate">
                                {step.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {step.role_required} • {step.estimated_duration_hours}h
                                {step.is_mandatory && <span className="ml-1 text-destructive">*</span>}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {step.is_mandatory && (
                                <Badge variant="secondary" className="text-xs">
                                  Obligatoire
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {step.role_required}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Total: {selectedWorkflowForStart.steps.length} étapes</span>
                        <span>
                          Durée estimée: {selectedWorkflowForStart.steps.reduce((total, step) => total + step.estimated_duration_hours, 0)}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowStartDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit">
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer le Workflow
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le workflow "{pendingAction?.workflow?.name}" ?
              Cette action est irréversible et supprimera toutes les instances associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showToggleConfirm} onOpenChange={setShowToggleConfirm}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.workflow?.is_active ? 'Désactiver' : 'Activer'} le workflow
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment {pendingAction?.workflow?.is_active ? 'désactiver' : 'activer'} le workflow 
              "{pendingAction?.workflow?.name}" ?
              {pendingAction?.workflow?.is_active && 
                " Les instances en cours continueront de fonctionner mais aucune nouvelle instance ne pourra être créée."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmedAction}>
              {pendingAction?.workflow?.is_active ? 'Désactiver' : 'Activer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCompleteConfirm} onOpenChange={setShowCompleteConfirm}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir approuver cette étape du workflow ?
              Cette action marquera l'étape comme terminée et passera à l'étape suivante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedAction}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Approuver l'étape
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRejectConfirm} onOpenChange={setShowRejectConfirm}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le rejet</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir rejeter cette étape du workflow ?
              Cette action nécessitera une correction avant de pouvoir continuer le processus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Rejeter l'étape
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}