import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Clock, Users, Calendar, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface SpaceReservation {
  id: string;
  event_title: string;
  event_description: string | null;
  organization_name: string;
  start_date: string;
  end_date: string;
  participants_count: number;
  status: string;
  created_at: string;
  space_id: string;
}

export function MySpaceReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<SpaceReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedReservations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReservations(data);
    } catch (error) {
      console.error('Error fetching space reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      en_attente: { label: "En attente", variant: "default" },
      approuvee: { label: "Approuvée", variant: "secondary" },
      rejetee: { label: "Rejetée", variant: "destructive" },
      annulee: { label: "Annulée", variant: "outline" }
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réservations d'espaces</CardTitle>
        <CardDescription>
          Suivez vos réservations d'espaces
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune réservation d'espace pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{reservation.event_title}</h3>
                        <p className="text-sm text-muted-foreground">{reservation.organization_name}</p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    {reservation.event_description && (
                      <p className="text-sm mb-3 line-clamp-2">{reservation.event_description}</p>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Du {formatDateTime(reservation.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Au {formatDateTime(reservation.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>{reservation.participants_count} participants</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Créée le {formatDateTime(reservation.created_at)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(reservation.id)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          Historique
                          {expandedReservations.has(reservation.id) ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Timeline des opérations */}
                    <Collapsible open={expandedReservations.has(reservation.id)}>
                      <CollapsibleContent className="pt-3 mt-3 border-t">
                        <ActivityTimeline 
                          resourceType="booking" 
                          resourceId={reservation.id} 
                          compact 
                        />
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
