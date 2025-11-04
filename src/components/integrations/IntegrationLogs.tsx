import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function IntegrationLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['integration-sync-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_sync_logs')
        .select('*, external_integrations(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      started: 'Démarré',
      in_progress: 'En cours',
      completed: 'Terminé',
      failed: 'Échec',
      partial: 'Partiel',
    };
    return labels[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'partial':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun log de synchronisation</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log: any) => (
        <Card key={log.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  <CardTitle className="text-lg">
                    {log.external_integrations?.name || 'Intégration inconnue'}
                  </CardTitle>
                  <Badge variant={getStatusVariant(log.status)}>
                    {getStatusLabel(log.status)}
                  </Badge>
                  {log.entity_type && (
                    <Badge variant="outline">{log.entity_type}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                  {log.duration_ms && ` • Durée: ${(log.duration_ms / 1000).toFixed(2)}s`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Total</p>
                <p className="font-medium text-lg">{log.records_total}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Traités</p>
                <p className="font-medium text-lg">{log.records_processed}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Succès</p>
                <p className="font-medium text-lg text-success">{log.records_success}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Échecs</p>
                <p className="font-medium text-lg text-destructive">{log.records_failed}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Ignorés</p>
                <p className="font-medium text-lg">{log.records_skipped}</p>
              </div>
            </div>
            
            {log.error_message && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                <p className="text-sm text-destructive font-medium">Erreur</p>
                <p className="text-sm text-destructive/80 mt-1">{log.error_message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
