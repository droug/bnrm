import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  FileText,
  ArrowRight,
  History,
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Edit,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  actor?: string;
  actorEmail?: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  stepName?: string;
  details?: Record<string, any>;
}

interface ActivityTimelineProps {
  resourceType: 'legal_deposit' | 'restoration' | 'reproduction' | 'booking' | 'reservation';
  resourceId: string;
  compact?: boolean;
}

// Configuration des statuts par type de ressource
const statusConfigs: Record<string, Record<string, { label: string; color: string; icon: React.ElementType }>> = {
  legal_deposit: {
    brouillon: { label: "Brouillon", color: "bg-gray-100 text-gray-700", icon: Edit },
    soumis: { label: "Soumis", color: "bg-blue-100 text-blue-700", icon: Send },
    en_attente_validation_b: { label: "En validation B", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    valide_par_b: { label: "Validé par B", color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejete_par_b: { label: "Rejeté par B", color: "bg-red-100 text-red-700", icon: XCircle },
    en_attente_comite_validation: { label: "En attente comité", color: "bg-purple-100 text-purple-700", icon: Clock },
    valide_par_comite: { label: "Validé par comité", color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejete_par_comite: { label: "Rejeté par comité", color: "bg-red-100 text-red-700", icon: XCircle },
    attribue: { label: "Numéro DL attribué", color: "bg-emerald-100 text-emerald-700", icon: Award },
    termine: { label: "Terminé", color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejete: { label: "Rejeté", color: "bg-red-100 text-red-700", icon: XCircle },
  },
  restoration: {
    soumise: { label: "Soumise", color: "bg-blue-100 text-blue-700", icon: Send },
    en_cours: { label: "En cours", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    terminee: { label: "Terminée", color: "bg-green-100 text-green-700", icon: CheckCircle },
    annulee: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
    en_attente: { label: "En attente", color: "bg-orange-100 text-orange-700", icon: Clock },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700", icon: XCircle },
  },
  reproduction: {
    soumise: { label: "Soumise", color: "bg-blue-100 text-blue-700", icon: Send },
    en_traitement: { label: "En traitement", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    terminee: { label: "Terminée", color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700", icon: XCircle },
  },
  booking: {
    en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    approuvee: { label: "Approuvée", color: "bg-green-100 text-green-700", icon: CheckCircle },
    refusee: { label: "Refusée", color: "bg-red-100 text-red-700", icon: XCircle },
    terminee: { label: "Terminée", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
    annulee: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
  },
  reservation: {
    soumise: { label: "Soumise", color: "bg-blue-100 text-blue-700", icon: Send },
    en_cours: { label: "En cours", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    validee: { label: "Validée", color: "bg-green-100 text-green-700", icon: CheckCircle },
    retiree: { label: "Retirée", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    retournee: { label: "Retournée", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
    annulee: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
  },
};

export function ActivityTimeline({ resourceType, resourceId, compact = false }: ActivityTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(!compact);

  useEffect(() => {
    if (resourceId) {
      fetchActivityHistory();
    }
  }, [resourceId, resourceType]);

  const fetchActivityHistory = async () => {
    setLoading(true);
    const allEvents: TimelineEvent[] = [];

    try {
      // 1. Fetch from activity_logs
      const { data: activityLogs } = await supabase
        .from('activity_logs')
        .select('id, action, details, created_at, user_id')
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: true });

      if (activityLogs) {
        for (const log of activityLogs) {
          const details = log.details as Record<string, any> || {};
          allEvents.push({
            id: log.id,
            timestamp: log.created_at || '',
            action: log.action,
            actor: details?.actor_name || details?.user_name,
            actorEmail: details?.actor_email || details?.user_email,
            previousStatus: details?.old_status || details?.previous_status,
            newStatus: details?.new_status || details?.status,
            notes: details?.notes || details?.reason || details?.comment,
            details,
          });
        }
      }

      // 2. Fetch specific history tables based on resource type
      if (resourceType === 'restoration') {
        const { data: restorationHistory } = await supabase
          .from('restoration_request_history')
          .select(`
            id,
            previous_status,
            new_status,
            notes,
            changed_at,
            changed_by,
            profiles:changed_by(first_name, last_name)
          `)
          .eq('request_id', resourceId)
          .order('changed_at', { ascending: true });

        if (restorationHistory) {
          for (const entry of restorationHistory) {
            const profile = entry.profiles as any;
            const actorName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined;
            allEvents.push({
              id: entry.id,
              timestamp: entry.changed_at || '',
              action: 'status_change',
              actor: actorName,
              previousStatus: entry.previous_status,
              newStatus: entry.new_status,
              notes: entry.notes,
            });
          }
        }
      }

      if (resourceType === 'reproduction') {
        const { data: reproductionSteps } = await supabase
          .from('reproduction_workflow_steps')
          .select(`
            id,
            step_name,
            step_number,
            status,
            comments,
            validated_at,
            validator_id,
            profiles:validator_id(first_name, last_name)
          `)
          .eq('request_id', resourceId)
          .order('step_number', { ascending: true });

        if (reproductionSteps) {
          for (const step of reproductionSteps) {
            if (step.validated_at) {
              const profile = step.profiles as any;
              const actorName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : undefined;
              allEvents.push({
                id: step.id,
                timestamp: step.validated_at,
                action: 'step_completed',
                actor: actorName,
                stepName: step.step_name,
                newStatus: step.status,
                notes: step.comments,
              });
            }
          }
        }
      }

      if (resourceType === 'booking') {
        const { data: bookingHistory } = await supabase
          .from('booking_workflow_history')
          .select('*')
          .eq('booking_id', resourceId)
          .order('processed_at', { ascending: true });

        if (bookingHistory) {
          for (const entry of bookingHistory) {
            allEvents.push({
              id: entry.id,
              timestamp: entry.processed_at || '',
              action: entry.decision,
              stepName: entry.step_name,
              notes: entry.comment,
            });
          }
        }
      }

      // Sort all events by timestamp
      allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Remove duplicates based on timestamp + action
      const uniqueEvents = allEvents.reduce((acc, event) => {
        const key = `${event.timestamp}-${event.action}-${event.newStatus}`;
        if (!acc.find(e => `${e.timestamp}-${e.action}-${e.newStatus}` === key)) {
          acc.push(event);
        }
        return acc;
      }, [] as TimelineEvent[]);

      setEvents(uniqueEvents);
    } catch (error) {
      console.error('[ActivityTimeline] Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const config = statusConfigs[resourceType]?.[status];
    return config || { label: status, color: "bg-gray-100 text-gray-700", icon: AlertCircle };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action: string) => {
    const actionLabels: Record<string, string> = {
      'status_change': 'Changement de statut',
      'step_completed': 'Étape validée',
      'created': 'Création',
      'submitted': 'Soumission',
      'approved': 'Approbation',
      'rejected': 'Rejet',
      'updated': 'Mise à jour',
      'view': 'Consultation',
      'validation_b': 'Validation B',
      'validation_comite': 'Validation Comité',
      'attribution_dl': 'Attribution DL',
    };
    return actionLabels[action] || action.replace(/_/g, ' ');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucun historique disponible</p>
        </div>
      );
    }

    return (
      <ScrollArea className={compact ? "max-h-[250px]" : "max-h-[400px]"}>
        <div className="relative pl-6">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-4">
            {events.map((event, index) => {
              const statusConfig = event.newStatus ? getStatusConfig(event.newStatus) : null;
              const StatusIcon = statusConfig?.icon || Clock;
              const isLast = index === events.length - 1;

              return (
                <div key={event.id} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 mt-1.5 w-4 h-4 rounded-full border-2 border-background ${
                    isLast ? 'bg-primary' : 'bg-muted'
                  } flex items-center justify-center`}>
                    {isLast && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                  </div>

                  <div className={`${compact ? 'p-2' : 'p-3'} rounded-lg border bg-card hover:bg-accent/50 transition-colors`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Action / Status change */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {event.previousStatus && event.newStatus ? (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {getStatusConfig(event.previousStatus).label}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge className={`text-xs ${statusConfig?.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig?.label}
                              </Badge>
                            </>
                          ) : event.newStatus ? (
                            <Badge className={`text-xs ${statusConfig?.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig?.label}
                            </Badge>
                          ) : event.stepName ? (
                            <Badge variant="secondary" className="text-xs">
                              {event.stepName}
                            </Badge>
                          ) : (
                            <span className="text-sm font-medium">
                              {getActionLabel(event.action)}
                            </span>
                          )}
                        </div>

                        {/* Actor */}
                        {(event.actor || event.actorEmail) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <User className="h-3 w-3" />
                            <span>{event.actor || event.actorEmail}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {event.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{event.notes}"
                          </p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(event.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    );
  };

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between hover:bg-accent">
            <span className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique des opérations ({events.length})
            </span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          {renderContent()}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Historique des opérations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
