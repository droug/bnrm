import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimpleRoleSelector } from "./SimpleRoleSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, RefreshCw, Workflow, GitBranch, Users, ArrowRight, Trash2, Save, AlertTriangle, CheckCircle, Edit, ArrowDown } from "lucide-react";
import { CreateWorkflowDialog } from "./CreateWorkflowDialog";
import { CreateStepDialog } from "./CreateStepDialog";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { CreateTransitionDialog } from "./CreateTransitionDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface WorkflowModel {
  id: string;
  name: string;
  workflow_type: string;
  module: string;
  description?: string;
}

interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_name: string;
  step_type: string;
  step_number: number;
  required_role?: string;
}

interface WorkflowRole {
  id: string;
  role_name: string;
  module: string;
  role_level?: string;
  description?: string;
}

interface WorkflowTransition {
  id: string;
  workflow_id: string;
  transition_name: string;
  from_step_id?: string;
  to_step_id?: string;
  trigger_type?: string;
}

export function WorkflowDynamicSelects() {
  // États pour les données
  const [workflows, setWorkflows] = useState<WorkflowModel[]>([]);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [roles, setRoles] = useState<WorkflowRole[]>([]);
  const [transitions, setTransitions] = useState<WorkflowTransition[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les sélections
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [selectedStep, setSelectedStep] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedTransition, setSelectedTransition] = useState<string>("");

  // États pour les listes filtrées
  const [filteredSteps, setFilteredSteps] = useState<WorkflowStep[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<WorkflowRole[]>([]);
  const [filteredTransitions, setFilteredTransitions] = useState<WorkflowTransition[]>([]);

  // États pour les dialogues
  const [createWorkflowOpen, setCreateWorkflowOpen] = useState(false);
  const [createStepOpen, setCreateStepOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createTransitionOpen, setCreateTransitionOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'step' | 'transition', id: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exitWarningOpen, setExitWarningOpen] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    loadAllData();
  }, []);

  // Charger automatiquement les étapes du workflow standard
  useEffect(() => {
    if (selectedWorkflow) {
      loadDefaultSteps();
    }
  }, [selectedWorkflow]);

  // Filtrer les étapes quand le workflow change
  useEffect(() => {
    if (selectedWorkflow) {
      const filtered = steps.filter(s => s.workflow_id === selectedWorkflow);
      setFilteredSteps(filtered);
      setSelectedStep("");
      setSelectedRole("");
      setSelectedTransition("");
    } else {
      setFilteredSteps([]);
    }
  }, [selectedWorkflow, steps]);

  // Filtrer les rôles quand l'étape change
  useEffect(() => {
    if (selectedStep) {
      const step = steps.find(s => s.id === selectedStep);
      const workflow = workflows.find(w => w.id === selectedWorkflow);
      
      if (workflow) {
        // Rôles administratifs internes de base
        const adminRoles = [
          'admin',
          'librarian',
          'editor',
          'printer',
          'producer',
          'distributor',
          'author',
          'researcher',
          'partner'
        ];
        
        // Rôles spécifiques par module/workflow
        const moduleSpecificRoles: Record<string, string[]> = {
          'legal_deposit': [
            'Agent Dépôt Légal',
            'Validateur BN',
            'Archiviste GED',
            'Auteur/Éditeur'
          ],
          'cataloging': [
            'Catalogueur',
            'Responsable Validation',
            'Administrateur BNRM'
          ],
          'ged': [
            'Agent Numérisation',
            'Contrôleur Qualité',
            'Responsable GED',
            'Archiviste'
          ],
          'cbm': [
            'Bibliothèque Partenaire',
            'Coordinateur CBM',
            'Administrateur CBM'
          ],
          'payment': [
            'Utilisateur Demandeur',
            'Gestionnaire Financier',
            'Responsable e-Payment',
            'Service Comptabilité'
          ],
          'portal': [
            'Rédacteur',
            'Responsable Éditorial',
            'Administrateur Portail'
          ],
          'analytics': [
            'Analyste',
            'Responsable Suivi-Évaluation',
            'Direction BNRM'
          ]
        };
        
        // Combiner les rôles de la base de données avec les rôles prédéfinis
        let availableRoles = [...roles];
        
        // Ajouter les rôles spécifiques au module si disponibles
        const moduleRoles = moduleSpecificRoles[workflow.module] || [];
        moduleRoles.forEach(roleName => {
          if (!availableRoles.find(r => r.role_name === roleName)) {
            availableRoles.push({
              id: `predefined-${roleName}`,
              role_name: roleName,
              module: workflow.module,
              role_level: 'module',
              description: `Rôle ${roleName} pour ${workflow.module}`
            });
          }
        });
        
        // Filtrer par module
        const filtered = availableRoles.filter(r => 
          r.module === workflow.module || 
          adminRoles.includes(r.role_name.toLowerCase()) ||
          moduleRoles.includes(r.role_name)
        );
        
        setFilteredRoles(filtered);
      }
      setSelectedRole("");
      setSelectedTransition("");
    } else {
      setFilteredRoles([]);
    }
  }, [selectedStep, steps, roles, workflows, selectedWorkflow]);

  // Filtrer les transitions quand l'étape et le rôle changent
  useEffect(() => {
    if (selectedStep) {
      const filtered = transitions.filter(
        t => t.workflow_id === selectedWorkflow && t.from_step_id === selectedStep
      );
      setFilteredTransitions(filtered);
      setSelectedTransition("");
    } else {
      setFilteredTransitions([]);
    }
  }, [selectedStep, selectedRole, transitions, selectedWorkflow]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [workflowsData, stepsData, rolesData, transitionsData] = await Promise.all([
        supabase.from('workflow_definitions').select('*').eq('is_active', true).order('name'),
        supabase.from('workflow_steps_new').select('*').order('step_number'),
        supabase.from('workflow_roles').select('*').order('role_name'),
        supabase.from('workflow_transitions').select('*')
      ]);

      if (workflowsData.error) throw workflowsData.error;
      if (stepsData.error) throw stepsData.error;
      if (rolesData.error) throw rolesData.error;
      
      setWorkflows(workflowsData.data || []);
      setSteps(stepsData.data || []);
      setRoles(rolesData.data || []);
      setTransitions(transitionsData.data || []);
      setHasUnsavedChanges(false);
      
      toast.success("Données chargées avec succès");
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSteps = async () => {
    if (!selectedWorkflow) return;
    
    // Les étapes sont déjà chargées dans loadAllData
    // On va juste filtrer pour afficher les étapes par défaut du workflow
    const defaultSteps = steps.filter(s => s.workflow_id === selectedWorkflow);
    setFilteredSteps(defaultSteps);
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_steps_new')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      toast.success("Étape supprimée avec succès");
      await loadAllData();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error("Erreur lors de la suppression de l'étape");
    }
  };

  const handleDeleteTransition = async (transitionId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_transitions')
        .delete()
        .eq('id', transitionId);

      if (error) throw error;

      toast.success("Transition supprimée avec succès");
      await loadAllData();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting transition:', error);
      toast.error("Erreur lors de la suppression de la transition");
    }
  };

  const confirmDelete = (type: 'step' | 'transition', id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const handleSaveWorkflow = async () => {
    // Ici on pourrait ajouter une logique de sauvegarde supplémentaire si nécessaire
    toast.success("Workflow enregistré avec succès");
    setHasUnsavedChanges(false);
  };

  const getWorkflowInfo = () => {
    if (!selectedWorkflow) return null;
    return workflows.find(w => w.id === selectedWorkflow);
  };

  const getStepInfo = () => {
    if (!selectedStep) return null;
    return steps.find(s => s.id === selectedStep);
  };

  const getRoleInfo = () => {
    if (!selectedRole) return null;
    return roles.find(r => r.id === selectedRole);
  };

  const getTransitionInfo = () => {
    if (!selectedTransition) return null;
    return transitions.find(t => t.id === selectedTransition);
  };

  const getStepTypeColor = (stepType: string) => {
    const colors: Record<string, string> = {
      'creation': 'bg-blue-500',
      'validation': 'bg-green-500',
      'correction': 'bg-orange-500',
      'archivage': 'bg-purple-500',
      'notification': 'bg-yellow-500',
      'transmission': 'bg-cyan-500',
    };
    return colors[stepType.toLowerCase()] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion Dynamique des Workflows</h2>
          <p className="text-muted-foreground">
            Configurez les workflows en sélectionnant type, étapes, rôles et transitions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {hasUnsavedChanges && (
            <Button onClick={handleSaveWorkflow} className="bg-[#194D9B] hover:bg-[#194D9B]/90">
              <Save className="h-4 w-4 mr-2" />
              Enregistrer le Workflow
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Sélection du type de workflow */}
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-blue-600" />
                <CardTitle>Type de Workflow</CardTitle>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateWorkflowOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un nouveau workflow
              </Button>
            </div>
            <CardDescription>
              Sélectionnez le type de processus métier à configurer
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Workflow</Label>
              <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choisir un workflow..." />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workflow.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {workflow.module}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getWorkflowInfo() && (
                <div className="p-4 bg-muted rounded-md text-sm border-l-4 border-primary">
                  <p className="font-medium text-base">{getWorkflowInfo()?.name}</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {getWorkflowInfo()?.description}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-blue-600">{getWorkflowInfo()?.workflow_type}</Badge>
                    <Badge variant="outline">{getWorkflowInfo()?.module}</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vue complète du workflow */}
        {selectedWorkflow && (
          <Card className="border-2 border-primary">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Configuration Complète du Workflow</CardTitle>
                  <CardDescription className="mt-1">
                    Vue d'ensemble de toutes les étapes et transitions
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setCreateStepOpen(true)}
                  className="bg-[#194D9B] hover:bg-[#194D9B]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une étape
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              {filteredSteps.length > 0 ? (
                <div className="space-y-6">
                  {filteredSteps.map((step, index) => {
                    const stepTransitions = filteredTransitions.filter(t => t.from_step_id === step.id);
                    const nextStep = filteredSteps.find(s => s.step_number === step.step_number + 1);
                    
                    return (
                      <div key={step.id} className="space-y-4">
                        {/* Carte d'étape */}
                        <Card className="border-2 border-primary/30 hover:border-primary transition-all shadow-md hover:shadow-lg">
                          <CardHeader className={`${
                            step.step_type === 'creation' ? 'bg-blue-50 dark:bg-blue-950/20' :
                            step.step_type === 'validation' ? 'bg-green-50 dark:bg-green-950/20' :
                            step.step_type === 'correction' ? 'bg-orange-50 dark:bg-orange-950/20' :
                            step.step_type === 'archivage' ? 'bg-purple-50 dark:bg-purple-950/20' :
                            step.step_type === 'transmission' ? 'bg-cyan-50 dark:bg-cyan-950/20' :
                            'bg-gray-50 dark:bg-gray-950/20'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStepTypeColor(step.step_type)} text-white font-bold text-lg shadow-md`}>
                                  {step.step_number}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{step.step_name}</CardTitle>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Badge className={getStepTypeColor(step.step_type)}>
                                      {step.step_type}
                                    </Badge>
                                    {step.required_role && (
                                      <Badge variant="outline" className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {step.required_role}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => {
                                    setSelectedStep(step.id);
                                    setCreateStepOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-[#B71C1C] hover:text-[#B71C1C] hover:bg-[#B71C1C]/10"
                                  onClick={() => confirmDelete('step', step.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {/* Transitions de cette étape */}
                          {stepTransitions.length > 0 && (
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                                  <ArrowRight className="h-4 w-4" />
                                  Transitions disponibles :
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {stepTransitions.map((transition) => {
                                    const targetStep = filteredSteps.find(s => s.id === transition.to_step_id);
                                    return (
                                      <div 
                                        key={transition.id}
                                        className="flex items-center justify-between p-3 border rounded-lg bg-purple-50/50 dark:bg-purple-950/10 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <ArrowRight className="h-4 w-4 text-purple-600" />
                                          <div>
                                            <p className="font-medium text-sm">{transition.transition_name}</p>
                                            <div className="flex gap-1 mt-1">
                                              {transition.trigger_type && (
                                                <Badge variant="secondary" className="text-xs">
                                                  {transition.trigger_type}
                                                </Badge>
                                              )}
                                              {targetStep && (
                                                <Badge variant="outline" className="text-xs">
                                                  → {targetStep.step_name}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-[#B71C1C] hover:text-[#B71C1C] hover:bg-[#B71C1C]/10"
                                          onClick={() => confirmDelete('transition', transition.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() => {
                                    setSelectedStep(step.id);
                                    setCreateTransitionOpen(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-2" />
                                  Ajouter une transition
                                </Button>
                              </div>
                            </CardContent>
                          )}
                          
                          {stepTransitions.length === 0 && (
                            <CardContent className="pt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                  setSelectedStep(step.id);
                                  setCreateTransitionOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-2" />
                                Ajouter une transition
                              </Button>
                            </CardContent>
                          )}
                        </Card>
                        
                        {/* Flèche vers l'étape suivante */}
                        {index < filteredSteps.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowDown className="h-8 w-8 text-primary animate-bounce" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GitBranch className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-lg mb-4">
                    Aucune étape configurée pour ce workflow
                  </p>
                  <Button
                    onClick={() => setCreateStepOpen(true)}
                    className="bg-[#194D9B] hover:bg-[#194D9B]/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer la première étape
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Résumé de la configuration */}
      {selectedWorkflow && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Résumé de la Configuration</CardTitle>
            <CardDescription>
              Configuration actuelle du workflow sélectionné
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-1 text-center">
                <Workflow className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="font-medium">{getWorkflowInfo()?.name}</p>
                <Badge className="mt-1">{getWorkflowInfo()?.module}</Badge>
              </div>
              
              {selectedStep && (
                <>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 text-center">
                    <GitBranch className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">{getStepInfo()?.step_name}</p>
                    <Badge className="mt-1">{getStepInfo()?.step_type}</Badge>
                  </div>
                </>
              )}
              
              {selectedRole && (
                <>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="font-medium">{getRoleInfo()?.role_name}</p>
                    <Badge className="mt-1">{getRoleInfo()?.role_level}</Badge>
                  </div>
                </>
              )}
              
              {selectedTransition && (
                <>
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 text-center">
                    <ArrowRight className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="font-medium">{getTransitionInfo()?.transition_name}</p>
                    {getTransitionInfo()?.trigger_type && (
                      <Badge className="mt-1">{getTransitionInfo()?.trigger_type}</Badge>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bouton de validation final */}
      {selectedWorkflow && (
        <div className="flex justify-center mt-8">
          <Button 
            size="lg"
            onClick={handleSaveWorkflow}
            className="bg-[#194D9B] hover:bg-[#194D9B]/90 text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="h-6 w-6 mr-3" />
            💾 Valider et Enregistrer le Workflow
          </Button>
        </div>
      )}

      {/* Dialogues de création */}
      <CreateWorkflowDialog 
        open={createWorkflowOpen} 
        onOpenChange={setCreateWorkflowOpen}
        onSuccess={() => {
          loadAllData();
          setHasUnsavedChanges(true);
        }}
      />
      <CreateStepDialog 
        open={createStepOpen} 
        onOpenChange={setCreateStepOpen}
        workflowId={selectedWorkflow}
        onSaved={() => {
          loadAllData();
          setHasUnsavedChanges(true);
        }}
      />
      <CreateRoleDialog 
        open={createRoleOpen} 
        onOpenChange={setCreateRoleOpen}
        onSaved={() => {
          loadAllData();
          setHasUnsavedChanges(true);
        }}
      />
      <CreateTransitionDialog 
        open={createTransitionOpen} 
        onOpenChange={setCreateTransitionOpen}
        workflowId={selectedWorkflow}
        fromStepId={selectedStep}
        onSaved={() => {
          loadAllData();
          setHasUnsavedChanges(true);
        }}
      />

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#B71C1C]" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment supprimer cette {itemToDelete?.type === 'step' ? 'étape' : 'transition'} du workflow ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>❌ Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#B71C1C] hover:bg-[#B71C1C]/90"
              onClick={() => {
                if (itemToDelete) {
                  if (itemToDelete.type === 'step') {
                    handleDeleteStep(itemToDelete.id);
                  } else {
                    handleDeleteTransition(itemToDelete.id);
                  }
                }
              }}
            >
              ✅ Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogue d'avertissement avant de quitter */}
      <AlertDialog open={exitWarningOpen} onOpenChange={setExitWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Modifications non enregistrées
            </AlertDialogTitle>
            <AlertDialogDescription>
              Les modifications non enregistrées seront perdues. Souhaitez-vous continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasUnsavedChanges(false);
                setExitWarningOpen(false);
              }}
            >
              Continuer sans enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
