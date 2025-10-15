import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link2, AlertCircle } from "lucide-react";

interface Integration {
  id: string;
  integration_name: string;
  source_module: string;
  target_module: string;
  event_types: string[];
  is_active: boolean;
}

export function WorkflowIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_integrations')
        .select('*')
        .order('integration_name');

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast.error("Erreur lors du chargement des intégrations");
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_integrations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Intégration ${!currentStatus ? 'activée' : 'désactivée'}`);
      loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Intégrations Inter-Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{integration.integration_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {integration.source_module} → {integration.target_module}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {integration.event_types.map((event) => (
                      <Badge key={event} variant="outline" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Switch
                  checked={integration.is_active}
                  onCheckedChange={() => toggleIntegration(integration.id, integration.is_active)}
                />
              </div>
            ))}

            {integrations.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune intégration configurée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
