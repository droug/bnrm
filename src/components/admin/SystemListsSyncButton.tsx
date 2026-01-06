import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle, Globe, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { systemListsSyncEngine } from "@/services/systemListsSync";
import { SYSTEM_LISTS_DEFINITIONS } from "@/config/systemListsDefinitions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export const SystemListsSyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastReport, setLastReport] = useState<any>(null);
  const { toast } = useToast();

  // Statistiques par plateforme
  const platformStats = useMemo(() => {
    const stats: Record<string, number> = {};
    SYSTEM_LISTS_DEFINITIONS.forEach(list => {
      const platform = list.platform || 'BNRM';
      stats[platform] = (stats[platform] || 0) + 1;
    });
    return stats;
  }, []);

  const platformColors: Record<string, string> = {
    'BNRM': 'bg-blue-500',
    'CBM': 'bg-green-500',
    'DEPOT_LEGAL': 'bg-purple-500',
    'MANUSCRIPTS': 'bg-amber-500',
    'DIGITAL_LIBRARY': 'bg-cyan-500',
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      console.log(`🔄 Démarrage de la synchronisation de ${SYSTEM_LISTS_DEFINITIONS.length} listes (toutes plateformes)...`);
      
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
      {/* Statistiques par plateforme */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Listes par plateforme</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(platformStats).map(([platform, count]) => (
            <Badge 
              key={platform} 
              variant="secondary"
              className={`${platformColors[platform] || 'bg-gray-500'} text-white`}
            >
              {platform}: {count} listes
            </Badge>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          <span>Total: {SYSTEM_LISTS_DEFINITIONS.length} listes système</span>
        </div>
      </div>

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
            Synchroniser toutes les listes (toutes plateformes)
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
          <strong>ℹ️ Note :</strong> La synchronisation inclut toutes les plateformes (BNRM, CBM, Dépôt Légal, Manuscrits, Bibliothèque Numérique).
          Elle s'exécute automatiquement au démarrage de l'application.
        </AlertDescription>
      </Alert>
    </div>
  );
};
