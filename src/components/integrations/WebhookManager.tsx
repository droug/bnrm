import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, AlertCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WebhookManager() {
  const { toast } = useToast();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['integration-webhooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_webhooks')
        .select('*, external_integrations(name)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const copyWebhookUrl = (webhookId: string) => {
    const url = `${window.location.origin}/api/integration-webhook?webhook_id=${webhookId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copiée",
      description: "L'URL du webhook a été copiée dans le presse-papiers",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!webhooks || webhooks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun webhook configuré</p>
          <p className="text-sm text-muted-foreground mt-2">
            Créez une intégration avec le type "webhook" pour commencer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {webhooks.map((webhook: any) => (
        <Card key={webhook.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{webhook.webhook_name}</CardTitle>
                  <Badge variant={webhook.is_active ? "default" : "secondary"}>
                    {webhook.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <CardDescription>
                  {webhook.external_integrations?.name || 'Intégration inconnue'}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyWebhookUrl(webhook.id)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier l'URL
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Types d'événements autorisés</p>
              <div className="flex flex-wrap gap-2">
                {webhook.event_types?.map((event: string) => (
                  <Badge key={event} variant="outline">{event}</Badge>
                ))}
              </div>
            </div>

            {webhook.allowed_ips && webhook.allowed_ips.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">IPs autorisées</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.allowed_ips.map((ip: string) => (
                    <Badge key={ip} variant="secondary">{ip}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs font-mono break-all">
                {`${window.location.origin}/api/integration-webhook?webhook_id=${webhook.id}`}
              </p>
            </div>

            {webhook.webhook_secret && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-md">
                <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Signature requise</p>
                  <p className="text-muted-foreground mt-1">
                    Ce webhook nécessite une signature dans l'en-tête <code className="text-xs bg-background px-1 py-0.5 rounded">{webhook.signature_header}</code> 
                    ({webhook.signature_algorithm})
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
