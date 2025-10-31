import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { autocompleteListsSyncEngine, SyncReport } from "@/services/autocompleteListsSync";
import { AUTOCOMPLETE_LISTS_DEFINITIONS } from "@/data/autocompleteListsDefinitions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AutocompleteListsSyncButton = () => {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastReport, setLastReport] = useState<SyncReport | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    
    try {
      const report = await autocompleteListsSyncEngine.autoSync(AUTOCOMPLETE_LISTS_DEFINITIONS);
      
      setLastReport(report);
      
      toast({
        title: "✅ Synchronisation terminée",
        description: `Créées: ${report.created}, Mises à jour: ${report.updated}, Ignorées: ${report.skipped}, Échecs: ${report.failed}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSync}
        disabled={syncing}
        variant="outline"
        size="sm"
      >
        {syncing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Synchronisation en cours...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Synchroniser les listes auto-complètes
          </>
        )}
      </Button>

      {lastReport && (
        <Alert variant={lastReport.failed > 0 ? "destructive" : "default"}>
          <div className="flex items-start gap-2">
            {lastReport.failed === 0 ? (
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertDescription>
                <div className="font-semibold mb-2">
                  {lastReport.failed === 0 ? "Synchronisation réussie" : "Synchronisation avec erreurs"}
                </div>
                <ul className="text-sm space-y-1">
                  <li>✅ <strong>{lastReport.created}</strong> listes créées</li>
                  <li>🔄 <strong>{lastReport.updated}</strong> listes mises à jour</li>
                  <li>⏭️ <strong>{lastReport.skipped}</strong> listes ignorées</li>
                  {lastReport.failed > 0 && (
                    <li>❌ <strong>{lastReport.failed}</strong> échecs</li>
                  )}
                  <li className="text-muted-foreground">⏱️ Durée: {lastReport.duration}ms</li>
                </ul>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Alert>
        <AlertDescription className="text-xs text-muted-foreground">
          💡 <strong>Note:</strong> La synchronisation automatique s'exécute au démarrage de l'application.
          Ce bouton permet une synchronisation manuelle pour forcer la mise à jour des listes auto-complètes.
        </AlertDescription>
      </Alert>
    </div>
  );
};
