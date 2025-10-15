import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { RotateCcw, Eye } from "lucide-react";

interface HistoryEntry {
  id: string;
  version: number;
  changed_at: string;
  change_description?: string;
  is_active: boolean;
  changed_by?: string;
}

interface WorkflowVersionHistoryProps {
  workflowId: string;
}

export function WorkflowVersionHistory({ workflowId }: WorkflowVersionHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [workflowId]);

  const loadHistory = async () => {
    try {
      // Pour l'instant, on utilise un tableau vide car la table workflow_models_history
      // n'a pas encore de données. Vous pouvez activer cette requête une fois que
      // vous aurez implémenté le système de versioning complet.
      
      // const { data, error } = await supabase
      //   .from('workflow_models_history')
      //   .select('*')
      //   .eq('workflow_definition_id', workflowId)
      //   .order('version', { ascending: false });
      // if (error) throw error;
      // setHistory(data || []);
      
      setHistory([]);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Historique des Versions</h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date de modification</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">v{entry.version}</TableCell>
              <TableCell>
                {format(new Date(entry.changed_at), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>{entry.change_description || "-"}</TableCell>
              <TableCell>
                {entry.is_active ? (
                  <Badge className="bg-green-500">Active</Badge>
                ) : (
                  <Badge variant="outline">Archivée</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  {!entry.is_active && (
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restaurer
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {history.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                Aucun historique disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}