import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Play, RefreshCw, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface IntegrationsListProps {
  onEdit: (integration: any) => void;
}

export default function IntegrationsList({ onEdit }: IntegrationsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['external-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data, error } = await supabase.functions.invoke('integration-sync', {
        body: { integrationId, syncType: 'manual' },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration-sync-logs'] });
      toast({
        title: "Synchronisation lancée",
        description: "La synchronisation a été démarrée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('external_integrations')
        .delete()
        .eq('id', integrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
      toast({
        title: "Succès",
        description: "L'intégration a été supprimée",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('external_integrations')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-integrations'] });
    },
  });

  const getIntegrationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sigb: 'SIGB',
      si: 'Système d\'Information',
      webhook: 'Webhook',
      api: 'API',
    };
    return labels[type] || type;
  };

  const getSyncDirectionLabel = (direction: string) => {
    const labels: Record<string, string> = {
      inbound: 'Entrant',
      outbound: 'Sortant',
      bidirectional: 'Bidirectionnel',
    };
    return labels[direction] || direction;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!integrations || integrations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune intégration configurée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {integrations.map((integration) => (
        <Card key={integration.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{integration.name}</CardTitle>
                  <Badge variant={integration.is_active ? "default" : "secondary"}>
                    {integration.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="outline">
                    {getIntegrationTypeLabel(integration.integration_type)}
                  </Badge>
                </div>
                {integration.description && (
                  <CardDescription>{integration.description}</CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncMutation.mutate(integration.id)}
                  disabled={!integration.is_active || syncMutation.isPending}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(integration)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(integration.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Direction</p>
                <p className="font-medium">{getSyncDirectionLabel(integration.sync_direction)}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Fréquence</p>
                <p className="font-medium">{integration.sync_frequency || 'Manuel'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Entités</p>
                <p className="font-medium">{integration.sync_entities?.join(', ') || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Dernière sync</p>
                <p className="font-medium">
                  {integration.last_sync_at
                    ? formatDistanceToNow(new Date(integration.last_sync_at), {
                        addSuffix: true,
                        locale: fr,
                      })
                    : 'Jamais'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
