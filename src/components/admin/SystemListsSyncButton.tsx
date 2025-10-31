import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { systemListsSyncEngine } from "@/services/systemListsSync";
import { SYSTEM_LISTS_DEFINITIONS } from "@/config/systemListsDefinitions";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SystemListsSyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastReport, setLastReport] = useState<any>(null);
  const { toast } = useToast();

  const handleSync = async () => {
    setSyncing(true);
    try {
      console.log(`🔄 Démarrage de la synchronisation de ${SYSTEM_LISTS_DEFINITIONS.length} listes...`);
      
      const report = await systemListsSyncEngine.autoSync(SYSTEM_LISTS_DEFINITIONS);
      setLastReport(report);

      toast({
        title: "✅ Synchronisation terminée",
        description: `${report.created} créées, ${report.updated} mises à jour, ${report.skipped} ignorées. ${report.failed > 0 ? `${report.failed} erreurs.` : ''}`,
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "❌ Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
        duration: 5000,
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
        className="w-full"
        size="lg"
      >
        {syncing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Synchronisation en cours...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Synchroniser toutes les listes système
          </>
        )}
      </Button>

      {lastReport && (
        <Alert className={lastReport.failed > 0 ? "border-destructive" : "border-green-500"}>
          <div className="flex items-start gap-3">
            {lastReport.failed > 0 ? (
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            )}
            <div className="flex-1 space-y-1">
              <AlertDescription className="font-medium">
                Dernière synchronisation : {new Date(Date.now()).toLocaleString('fr-FR')}
              </AlertDescription>
              <AlertDescription className="text-sm text-muted-foreground">
                {SYSTEM_LISTS_DEFINITIONS.length} listes totales • 
                {lastReport.created > 0 && ` ${lastReport.created} créées •`}
                {lastReport.updated > 0 && ` ${lastReport.updated} mises à jour •`}
                {lastReport.skipped > 0 && ` ${lastReport.skipped} ignorées •`}
                {lastReport.failed > 0 && ` ${lastReport.failed} erreurs •`}
                {` ${lastReport.duration}ms`}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      <Alert>
        <AlertDescription className="text-sm">
          <strong>ℹ️ Note :</strong> La synchronisation automatique s'exécute au démarrage de l'application. 
          Ce bouton permet une synchronisation manuelle pour forcer la mise à jour immédiate.
        </AlertDescription>
      </Alert>
    </div>
  );
};
