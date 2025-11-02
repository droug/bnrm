import { useEffect, useState } from 'react';
import { WorkflowAutoSync } from '@/lib/workflowAutoSync';

interface UseWorkflowAutoSyncOptions {
  workflowId?: string | null;
  enabled?: boolean;
  onSync?: (workflowId: string) => void;
}

/**
 * Hook pour gérer la synchronisation automatique des workflows
 */
export function useWorkflowAutoSync(options: UseWorkflowAutoSyncOptions = {}) {
  const { workflowId, enabled = true, onSync } = options;
  const [syncStatus, setSyncStatus] = useState<{
    hasChanges: boolean;
    changes: string[];
    lastSync: Date | null;
  }>({
    hasChanges: false,
    changes: [],
    lastSync: null
  });
  const [syncing, setSyncing] = useState(false);

  // Détecter les modifications
  useEffect(() => {
    if (!enabled || !workflowId) return;

    const detectChanges = async () => {
      const result = await WorkflowAutoSync.detectWorkflowChanges(workflowId);
      setSyncStatus(prev => ({
        ...prev,
        hasChanges: result.hasChanges,
        changes: result.changes
      }));
    };

    detectChanges();
  }, [workflowId, enabled]);

  // Configurer l'écoute en temps réel
  useEffect(() => {
    if (!enabled) return;

    const cleanup = WorkflowAutoSync.setupRealtimeSync((changedWorkflowId) => {
      // Mettre à jour le statut de synchronisation
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));

      // Callback personnalisé
      onSync?.(changedWorkflowId);
    });

    return cleanup;
  }, [enabled, onSync]);

  // Fonction pour synchroniser manuellement
  const syncWorkflow = async (targetWorkflowId?: string) => {
    const idToSync = targetWorkflowId || workflowId;
    if (!idToSync) return false;

    setSyncing(true);
    try {
      const success = await WorkflowAutoSync.syncWorkflowToJSON(idToSync);
      if (success) {
        setSyncStatus(prev => ({
          ...prev,
          hasChanges: false,
          changes: [],
          lastSync: new Date()
        }));
      }
      return success;
    } finally {
      setSyncing(false);
    }
  };

  // Fonction pour synchroniser tous les workflows
  const syncAllWorkflows = async () => {
    setSyncing(true);
    try {
      const count = await WorkflowAutoSync.syncAllWorkflowsToJSON();
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
      return count;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncStatus,
    syncing,
    syncWorkflow,
    syncAllWorkflows
  };
}
