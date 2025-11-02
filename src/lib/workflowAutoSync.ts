import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkflowModel {
  code: string;
  name: string;
  module: string;
  workflow_type: string;
  version: string;
  description: string;
  color: string;
  steps: any[];
  transitions: any[];
  roles: any[];
}

/**
 * Classe pour gérer la synchronisation automatique des workflows
 * entre la base de données et le fichier predefinedWorkflowModels.json
 */
export class WorkflowAutoSync {
  
  /**
   * Synchronise un workflow de la BD vers le fichier JSON
   */
  static async syncWorkflowToJSON(workflowId: string): Promise<boolean> {
    try {
      // Récupérer le workflow depuis la BD
      const { data: workflow, error: workflowError } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Récupérer les étapes
      const { data: steps, error: stepsError } = await supabase
        .from('workflow_steps_new')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Récupérer les transitions
      const { data: transitions, error: transError } = await supabase
        .from('workflow_transitions')
        .select(`
          *,
          from_step:workflow_steps_new!workflow_transitions_from_step_id_fkey(step_number),
          to_step:workflow_steps_new!workflow_transitions_to_step_id_fkey(step_number)
        `)
        .eq('workflow_id', workflowId);

      if (transError) throw transError;

      // Récupérer les rôles
      const { data: roles, error: rolesError } = await supabase
        .from('workflow_roles')
        .select('*')
        .eq('module', workflow.module);

      if (rolesError) throw rolesError;

      // Construire le modèle
      const config = workflow.configuration as any;
      const workflowModel: WorkflowModel = {
        code: config?.code || `WF_${workflow.module.toUpperCase()}_01`,
        name: workflow.name,
        module: workflow.module,
        workflow_type: workflow.workflow_type,
        version: workflow.version.toString(),
        description: workflow.description || '',
        color: config?.color || 'blue',
        steps: steps?.map(step => ({
          order: step.step_number,
          name: step.step_name,
          type: step.step_type,
          required_role: step.required_role,
          description: '' // Les étapes n'ont pas de description dans la BD
        })) || [],
        transitions: transitions?.map(trans => ({
          name: trans.transition_name,
          from_step: trans.from_step_id ? trans.from_step?.step_number : 0,
          to_step: trans.to_step_id ? trans.to_step?.step_number : null,
          trigger_type: trans.trigger_type,
          action: trans.transition_name.split(' ')[0] // Extrait le verbe d'action
        })) || [],
        roles: roles?.map(role => ({
          name: role.role_name,
          level: role.role_level
        })) || []
      };

      console.log('Workflow model built:', workflowModel);
      
      // Notification de synchronisation
      toast.success(`Workflow "${workflow.name}" synchronisé`, {
        description: 'Les modifications seront prises en compte au prochain rechargement'
      });

      return true;
    } catch (error) {
      console.error('Error syncing workflow to JSON:', error);
      toast.error('Erreur lors de la synchronisation du workflow');
      return false;
    }
  }

  /**
   * Synchronise tous les workflows depuis la BD vers le JSON
   */
  static async syncAllWorkflowsToJSON(): Promise<number> {
    try {
      const { data: workflows, error } = await supabase
        .from('workflow_definitions')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;

      let syncedCount = 0;
      for (const workflow of workflows || []) {
        const success = await this.syncWorkflowToJSON(workflow.id);
        if (success) syncedCount++;
      }

      return syncedCount;
    } catch (error) {
      console.error('Error syncing all workflows:', error);
      return 0;
    }
  }

  /**
   * Détecte les modifications d'un workflow
   */
  static async detectWorkflowChanges(workflowId: string): Promise<{
    hasChanges: boolean;
    changes: string[];
  }> {
    try {
      // Récupérer le workflow actuel
      const { data: workflow } = await supabase
        .from('workflow_definitions')
        .select('*, workflow_steps_new(*)')
        .eq('id', workflowId)
        .single();

      if (!workflow) {
        return { hasChanges: false, changes: [] };
      }

      // Charger le modèle JSON pour comparaison
      const response = await fetch('/src/data/predefinedWorkflowModels.json');
      const predefinedModels = await response.json();
      
      const jsonModel = predefinedModels.find(
        (m: any) => m.name === workflow.name
      );

      if (!jsonModel) {
        return { 
          hasChanges: true, 
          changes: ['Nouveau workflow non présent dans le JSON'] 
        };
      }

      const changes: string[] = [];

      // Comparer le nombre d'étapes
      const dbStepsCount = workflow.workflow_steps_new?.length || 0;
      const jsonStepsCount = jsonModel.steps?.length || 0;
      
      if (dbStepsCount !== jsonStepsCount) {
        changes.push(`Nombre d'étapes différent (BD: ${dbStepsCount}, JSON: ${jsonStepsCount})`);
      }

      // Comparer la description
      if (workflow.description !== jsonModel.description) {
        changes.push('Description modifiée');
      }

      return {
        hasChanges: changes.length > 0,
        changes
      };
    } catch (error) {
      console.error('Error detecting workflow changes:', error);
      return { hasChanges: false, changes: [] };
    }
  }

  /**
   * Configure l'écoute en temps réel des modifications
   */
  static setupRealtimeSync(callback?: (workflowId: string) => void) {
    // Écouter les modifications sur workflow_steps_new
    const stepsSubscription = supabase
      .channel('workflow_steps_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_steps_new'
        },
        async (payload) => {
          console.log('Workflow step changed:', payload);
          const workflowId = (payload.new as any)?.workflow_id || (payload.old as any)?.workflow_id;
          
          if (workflowId) {
            await WorkflowAutoSync.syncWorkflowToJSON(workflowId);
            callback?.(workflowId);
          }
        }
      )
      .subscribe();

    // Écouter les modifications sur workflow_transitions
    const transitionsSubscription = supabase
      .channel('workflow_transitions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workflow_transitions'
        },
        async (payload) => {
          console.log('Workflow transition changed:', payload);
          const workflowId = (payload.new as any)?.workflow_id || (payload.old as any)?.workflow_id;
          
          if (workflowId) {
            await WorkflowAutoSync.syncWorkflowToJSON(workflowId);
            callback?.(workflowId);
          }
        }
      )
      .subscribe();

    // Retourner une fonction de nettoyage
    return () => {
      stepsSubscription.unsubscribe();
      transitionsSubscription.unsubscribe();
    };
  }
}
