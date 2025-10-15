import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CheckCircle2, Clock, XCircle, Pause, Eye, Play } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StartWorkflowDialog } from "./StartWorkflowDialog";

interface WorkflowInstance {
  id: string;
  instance_number: string;
  workflow_id: string;
  entity_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  workflow_definitions?: {
    name: string;
    workflow_type: string;
  } | null;
}

export function WorkflowInstances() {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setInstances(data as any || []);

      // Calculate stats
      const newStats = {
        pending: data?.filter(i => i.status === 'pending').length || 0,
        in_progress: data?.filter(i => i.status === 'in_progress').length || 0,
        completed: data?.filter(i => i.status === 'completed').length || 0,
        rejected: data?.filter(i => i.status === 'rejected').length || 0,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error loading instances:', error);
      toast.error("Erreur lors du chargement des instances");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: "bg-yellow-500", label: "En attente" },
      in_progress: { icon: Activity, color: "bg-blue-500", label: "En cours" },
      completed: { icon: CheckCircle2, color: "bg-green-500", label: "Terminé" },
      rejected: { icon: XCircle, color: "bg-red-500", label: "Rejeté" },
      suspended: { icon: Pause, color: "bg-gray-500", label: "Suspendu" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejetés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Instances Actives</CardTitle>
            <Button onClick={() => setStartDialogOpen(true)}>
              <Play className="h-4 w-4 mr-2" />
              Lancer un workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Workflow</TableHead>
                <TableHead>Type d'entité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Démarré le</TableHead>
                <TableHead>Terminé le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-medium">
                    {instance.instance_number || "-"}
                  </TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>{instance.entity_type || "-"}</TableCell>
                  <TableCell>{getStatusBadge(instance.status)}</TableCell>
                  <TableCell>
                    {instance.started_at
                      ? format(new Date(instance.started_at), "dd MMM yyyy HH:mm", { locale: fr })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {instance.completed_at
                      ? format(new Date(instance.completed_at), "dd MMM yyyy HH:mm", { locale: fr })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {instances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Aucune instance de workflow en cours
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StartWorkflowDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        referenceType="general"
        onWorkflowStarted={loadInstances}
      />
    </div>
  );
}
