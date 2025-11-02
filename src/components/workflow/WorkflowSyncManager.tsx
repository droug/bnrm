import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Database, AlertCircle, CheckCircle2, Activity, ArrowLeftRight } from "lucide-react";
import { useWorkflowAutoSync } from "@/hooks/useWorkflowAutoSync";

interface WorkflowSyncStatus {
  total: number;
  synced: number;
  missing: number;
  status: 'idle' | 'syncing' | 'completed' | 'error';
}

export function WorkflowSyncManager() {
  const [syncStatus, setSyncStatus] = useState<WorkflowSyncStatus>({
    total: 0,
    synced: 0,
    missing: 0,
    status: 'idle'
  });
  const [missingWorkflows, setMissingWorkflows] = useState<string[]>([]);
  const { syncStatus: autoSyncStatus, syncAllWorkflows: autoSyncAll } = useWorkflowAutoSync({
    enabled: true,
    onSync: () => checkSyncStatus()
  });

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const checkSyncStatus = async () => {
    try {
      // Charger les modèles prédéfinis
      const response = await fetch('/src/data/predefinedWorkflowModels.json');
      const predefinedModels = await response.json();

      // Charger les workflows en base
      const { data: dbWorkflows, error } = await supabase
        .from('workflow_definitions')
        .select('name, configuration');

      if (error) throw error;

      const predefinedNames = predefinedModels.map((m: any) => m.name);
      const dbNames = dbWorkflows?.map(w => w.name) || [];
      
      const missing = predefinedNames.filter((name: string) => !dbNames.includes(name));

      setSyncStatus({
        total: predefinedModels.length,
        synced: predefinedModels.length - missing.length,
        missing: missing.length,
        status: 'idle'
      });
      setMissingWorkflows(missing);
    } catch (error) {
      console.error('Error checking sync status:', error);
      toast.error("Erreur lors de la vérification de synchronisation");
    }
  };

  const syncAllWorkflows = async () => {
    setSyncStatus(prev => ({ ...prev, status: 'syncing' }));

    try {
      // Charger tous les modèles prédéfinis
      const response = await fetch('/src/data/predefinedWorkflowModels.json');
      const predefinedModels = await response.json();

      let syncedCount = 0;

      for (const model of predefinedModels) {
        // Vérifier si le workflow existe déjà
        const { data: existing } = await supabase
          .from('workflow_definitions')
          .select('id')
          .eq('name', model.name)
          .maybeSingle();

        if (!existing) {
          // Créer le workflow s'il n'existe pas
          const { data: newWorkflow, error: workflowError } = await supabase
            .from('workflow_definitions')
            .insert({
              name: model.name,
              description: model.description,
              workflow_type: model.workflow_type,
              module: model.module,
              version: 1,
              is_active: true,
              configuration: { 
                predefined: true, 
                code: model.code,
                color: model.color,
                auto_synced: true
              }
            })
            .select('id')
            .single();

          if (workflowError) throw workflowError;

          // Créer les rôles
          for (const role of model.roles) {
            const { data: existingRole } = await supabase
              .from('workflow_roles')
              .select('id')
              .eq('role_name', role.name)
              .eq('module', model.module)
              .maybeSingle();

            if (!existingRole) {
              await supabase.from('workflow_roles').insert({
                role_name: role.name,
                module: model.module,
                role_level: role.level,
                description: `Rôle auto-synchronisé pour ${model.name}`
              });
            }
          }

          // Créer les étapes
          const stepMapping: Record<number, string> = {};
          for (const step of model.steps) {
            const { data: newStep } = await supabase
              .from('workflow_steps_new')
              .insert({
                workflow_id: newWorkflow.id,
                step_name: step.name,
                step_type: step.type,
                step_number: step.order,
                required_role: step.required_role
              })
              .select('id')
              .single();

            if (newStep) {
              stepMapping[step.order] = newStep.id;
            }
          }

          // Créer les transitions
          for (const transition of model.transitions) {
            const fromStepId = transition.from_step === 0 ? null : stepMapping[transition.from_step];
            const toStepId = transition.to_step === null ? null : stepMapping[transition.to_step];

            await supabase
              .from('workflow_transitions')
              .insert({
                workflow_id: newWorkflow.id,
                transition_name: transition.name,
                from_step_id: fromStepId,
                to_step_id: toStepId,
                trigger_type: transition.trigger_type
              });
          }

          syncedCount++;
        }
      }

      setSyncStatus({
        total: predefinedModels.length,
        synced: predefinedModels.length,
        missing: 0,
        status: 'completed'
      });

      if (syncedCount > 0) {
        toast.success(`${syncedCount} workflows synchronisés avec succès`);
      } else {
        toast.info("Tous les workflows sont déjà à jour");
      }

      await checkSyncStatus();
    } catch (error) {
      console.error('Error syncing workflows:', error);
      setSyncStatus(prev => ({ ...prev, status: 'error' }));
      toast.error("Erreur lors de la synchronisation");
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Synchronisation Automatique Bidirectionnelle
            </CardTitle>
            <CardDescription>
              Synchronisation automatique entre la base de données et les définitions de workflows
              {autoSyncStatus.lastSync && (
                <span className="block text-xs mt-1">
                  Dernière synchro: {autoSyncStatus.lastSync.toLocaleTimeString('fr-FR')}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={syncAllWorkflows}
              disabled={syncStatus.status === 'syncing'}
              variant={syncStatus.missing > 0 ? "default" : "outline"}
            >
              {syncStatus.status === 'syncing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Synchronisation...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Sync JSON → BD
                </>
              )}
            </Button>
            <Button
              onClick={autoSyncAll}
              variant="outline"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Sync BD → JSON
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Workflows</span>
            </div>
            <p className="text-2xl font-bold">{syncStatus.total}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">Synchronisés</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{syncStatus.synced}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Manquants</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{syncStatus.missing}</p>
          </div>
        </div>

        {missingWorkflows.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Workflows à synchroniser:</h4>
            <div className="flex flex-wrap gap-2">
              {missingWorkflows.map((name) => (
                <Badge key={name} variant="outline" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {syncStatus.status === 'completed' && syncStatus.missing === 0 && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Tous les workflows sont synchronisés</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
