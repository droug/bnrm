import { useEffect, useState } from "react";
import { systemListsSyncEngine, SyncStatus } from "@/services/systemListsSync";
import { SYSTEM_LISTS_DEFINITIONS } from "@/config/systemListsDefinitions";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook pour la synchronisation automatique des listes système
 * S'exécute au démarrage de l'application et détecte automatiquement les changements
 */
export function useAutoSync(autoStart = true) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [hasRun, setHasRun] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!autoStart || hasRun) return;

    const performAutoSync = async () => {
      try {
        console.log("🚀 Démarrage de la synchronisation automatique des listes système...");
        
        const report = await systemListsSyncEngine.autoSync(SYSTEM_LISTS_DEFINITIONS);
        
        setHasRun(true);

        // Notifier uniquement s'il y a eu des changements
        if (report.created > 0 || report.updated > 0) {
          toast({
            title: "✅ Listes système synchronisées",
            description: `${report.created} créées, ${report.updated} mises à jour`,
            duration: 3000,
          });
        } else if (report.failed > 0) {
          toast({
            title: "⚠️ Synchronisation partielle",
            description: `${report.failed} erreurs détectées`,
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error: any) {
        console.error("Erreur lors de la synchronisation automatique:", error);
        toast({
          title: "❌ Erreur de synchronisation",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    };

    // Exécuter avec un petit délai pour laisser l'app se charger
    const timeoutId = setTimeout(performAutoSync, 1000);

    return () => clearTimeout(timeoutId);
  }, [autoStart, hasRun, toast]);

  useEffect(() => {
    const handleStatusUpdate = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    systemListsSyncEngine.addSyncListener(handleStatusUpdate);

    return () => {
      systemListsSyncEngine.removeSyncListener(handleStatusUpdate);
    };
  }, []);

  const manualSync = async () => {
    try {
      const report = await systemListsSyncEngine.autoSync(SYSTEM_LISTS_DEFINITIONS);
      
      toast({
        title: "✅ Synchronisation terminée",
        description: `${report.created} créées, ${report.updated} mises à jour, ${report.skipped} ignorées`,
        duration: 5000,
      });

      return report;
    } catch (error: any) {
      toast({
        title: "❌ Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
      throw error;
    }
  };

  return {
    syncStatus,
    manualSync,
    isReady: hasRun,
    isSyncing: systemListsSyncEngine.isSyncInProgress(),
    lastSyncTime: systemListsSyncEngine.getLastSyncTime(),
  };
}
