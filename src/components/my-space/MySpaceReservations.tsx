import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Clock, Users, Calendar, History, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityTimeline } from "./ActivityTimeline";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AttachmentsSection } from "./AttachmentsSection";

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
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  organization_type?: string;
  total_amount?: number;
  rejection_reason?: string;
  admin_notes?: string;
  authorization_document_url?: string | null;
  justification_document_url?: string | null;
  program_document_url?: string | null;
  status_document_url?: string | null;
}

export function MySpaceReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<SpaceReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(new Set());
  const [selectedReservation, setSelectedReservation] = useState<SpaceReservation | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

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

  const handleViewDetails = (reservation: SpaceReservation) => {
    setSelectedReservation(reservation);
    setShowDetailsSheet(true);
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
    <>
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

                      <div className="space-y-2 text-sm text-muted-foreground mb-3">
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
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>Créée le {formatDateTime(reservation.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleViewDetails(reservation)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(reservation.id)}
                        >
                          <History className="h-4 w-4 mr-1" />
                          {expandedReservations.has(reservation.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
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

      {/* Sheet latéral pour les détails */}
      <Sheet open={showDetailsSheet} onOpenChange={setShowDetailsSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de la réservation</SheetTitle>
            <SheetDescription>
              Informations complètes sur votre réservation d'espace
            </SheetDescription>
          </SheetHeader>
          {selectedReservation && (
            <div className="space-y-6 py-6">
              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Statut</span>
                {getStatusBadge(selectedReservation.status)}
              </div>

              <Separator />

              {/* Événement */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Événement</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Titre</span>
                    <p className="font-medium">{selectedReservation.event_title}</p>
                  </div>
                  {selectedReservation.event_description && (
                    <div>
                      <span className="text-sm text-muted-foreground">Description</span>
                      <p className="text-sm">{selectedReservation.event_description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Nombre de participants</span>
                    <p className="font-medium">{selectedReservation.participants_count}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Organisation */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Organisation</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <p className="font-medium">{selectedReservation.organization_name}</p>
                  </div>
                  {selectedReservation.organization_type && (
                    <div>
                      <span className="text-sm text-muted-foreground">Type</span>
                      <p className="font-medium">{selectedReservation.organization_type}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact */}
              {(selectedReservation.contact_person || selectedReservation.contact_email || selectedReservation.contact_phone) && (
                <>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base">Contact</h4>
                    <div className="space-y-3">
                      {selectedReservation.contact_person && (
                        <div>
                          <span className="text-sm text-muted-foreground">Personne de contact</span>
                          <p className="font-medium">{selectedReservation.contact_person}</p>
                        </div>
                      )}
                      {selectedReservation.contact_email && (
                        <div>
                          <span className="text-sm text-muted-foreground">Email</span>
                          <p className="font-medium">{selectedReservation.contact_email}</p>
                        </div>
                      )}
                      {selectedReservation.contact_phone && (
                        <div>
                          <span className="text-sm text-muted-foreground">Téléphone</span>
                          <p className="font-medium">{selectedReservation.contact_phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Dates */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base">Dates</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Début</span>
                    <p className="font-medium">{formatDateTime(selectedReservation.start_date)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Fin</span>
                    <p className="font-medium">{formatDateTime(selectedReservation.end_date)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date de création</span>
                    <p className="font-medium">{formatDateTime(selectedReservation.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Montant */}
              {selectedReservation.total_amount != null && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Montant total</h4>
                    <p className="font-medium text-lg">{selectedReservation.total_amount} DH</p>
                  </div>
                </>
              )}

              {/* Rejet */}
              {selectedReservation.rejection_reason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base text-destructive">Motif de rejet</h4>
                    <p className="text-sm bg-destructive/10 p-3 rounded">{selectedReservation.rejection_reason}</p>
                  </div>
                </>
              )}

              {/* Notes admin */}
              {selectedReservation.admin_notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-base">Notes administratives</h4>
                    <p className="text-sm bg-muted p-3 rounded">{selectedReservation.admin_notes}</p>
                  </div>
                </>
              )}

              {/* Pièces jointes */}
              <AttachmentsSection
                attachments={[
                  { label: "Document d'autorisation", url: selectedReservation.authorization_document_url },
                  { label: "Justificatif", url: selectedReservation.justification_document_url },
                  { label: "Programme", url: selectedReservation.program_document_url },
                  { label: "Statut juridique", url: selectedReservation.status_document_url },
                ]}
              />

              <Separator />

              {/* Historique */}
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Historique des opérations</h4>
                <ActivityTimeline 
                  resourceType="booking" 
                  resourceId={selectedReservation.id} 
                  compact 
                />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}