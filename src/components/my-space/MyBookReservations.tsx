import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Clock, MapPin, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface BookReservation {
  id: string;
  document_title: string;
  document_author: string | null;
  document_id: string;
  requested_date: string;
  statut: string;
  motif: string;
  support_type: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export function MyBookReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<BookReservation[]>([]);
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
        .from('reservations_ouvrages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReservations(data);
    } catch (error) {
      console.error('Error fetching book reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      soumise: { label: "Soumise", variant: "default" },
      en_cours: { label: "En cours", variant: "default" },
      validee: { label: "Validée", variant: "secondary" },
      refusee: { label: "Refusée", variant: "destructive" },
      archivee: { label: "Archivée", variant: "outline" }
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
        <CardTitle>Réservations d'ouvrages</CardTitle>
        <CardDescription>
          Suivez vos réservations d'ouvrages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune réservation d'ouvrage pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{reservation.document_title}</h3>
                        {reservation.document_author && (
                          <p className="text-sm text-muted-foreground">{reservation.document_author}</p>
                        )}
                      </div>
                      {getStatusBadge(reservation.statut)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <p className="text-sm">
                        <span className="font-medium">Motif:</span> {reservation.motif}
                      </p>
                      {reservation.support_type && (
                        <p className="text-sm">
                          <span className="font-medium">Type:</span> {reservation.support_type}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Demandé le {formatDate(reservation.created_at)}
                        </span>
                        {reservation.requested_date && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Pour le {formatDate(reservation.requested_date)}
                          </span>
                        )}
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

                    {/* Timeline des opérations */}
                    <Collapsible open={expandedReservations.has(reservation.id)}>
                      <CollapsibleContent className="pt-3 mt-3 border-t">
                        <ActivityTimeline 
                          resourceType="reservation" 
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
