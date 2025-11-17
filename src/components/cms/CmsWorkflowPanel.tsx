import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

interface CmsWorkflowPanelProps {
  entityType: 'page' | 'actualite' | 'evenement';
  entityId?: string;
  currentStatus: string;
  workflowComments: any[];
  onStatusChange: (newStatus: string) => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Brouillon', color: 'secondary' },
  review: { label: 'En relecture', color: 'default' },
  ready: { label: 'Prêt à publier', color: 'default' },
  published: { label: 'Publié', color: 'default' },
  archived: { label: 'Archivé', color: 'secondary' }
};

const statusTransitions: Record<string, string[]> = {
  draft: ['review'],
  review: ['draft', 'ready'],
  ready: ['review', 'published'],
  published: ['archived'],
  archived: ['draft']
};

export default function CmsWorkflowPanel({
  entityType,
  entityId,
  currentStatus,
  workflowComments,
  onStatusChange
}: CmsWorkflowPanelProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTransitions = statusTransitions[currentStatus] || [];

  const handleStatusChange = async (newStatus: string) => {
    if (!entityId) {
      toast.error("Veuillez d'abord enregistrer avant de changer le statut");
      return;
    }

    if (!comment.trim()) {
      toast.error("Veuillez ajouter un commentaire");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/cms-admin-api/workflow/${entityType}/${entityId}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            newStatus,
            comment,
            action: getActionLabel(currentStatus, newStatus)
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du changement de statut');
      }

      onStatusChange(newStatus);
      setComment('');
      toast.success(`Statut changé : ${statusLabels[newStatus].label}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionLabel = (from: string, to: string): string => {
    if (to === 'review') return 'soumis_pour_relecture';
    if (to === 'ready') return 'validé';
    if (to === 'published') return 'publié';
    if (to === 'archived') return 'archivé';
    if (to === 'draft') return 'renvoyé_en_brouillon';
    return 'modifié';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow de Publication</CardTitle>
        <CardDescription>Gérez le cycle de vie du contenu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="space-y-2">
          <Label>Statut actuel</Label>
          <Badge variant={statusLabels[currentStatus]?.color as any || 'default'} className="text-sm">
            {statusLabels[currentStatus]?.label || currentStatus}
          </Badge>
        </div>

        {/* Actions disponibles */}
        {availableTransitions.length > 0 && entityId && (
          <div className="space-y-3">
            <Label>Changer le statut</Label>
            <div className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire obligatoire..."
                rows={3}
              />
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(status)}
                    disabled={isSubmitting || !comment.trim()}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    → {statusLabels[status].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historique des commentaires */}
        {workflowComments.length > 0 && (
          <div className="space-y-2">
            <Label>Historique</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {workflowComments.map((wc: any, i: number) => (
                <div key={i} className="text-sm p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {wc.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(wc.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{wc.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
