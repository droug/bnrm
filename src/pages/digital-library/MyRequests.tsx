import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationRequest {
  id: string;
  document_title: string;
  document_cote: string | null;
  requested_date: string;
  requested_time: string;
  status: string;
  comments: string | null;
  created_at: string;
}

interface DigitizationRequest {
  id: string;
  document_title: string;
  document_cote: string | null;
  pages_count: number;
  usage_type: string;
  justification: string;
  status: string;
  created_at: string;
}

export default function MyRequests() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [reservationRequests, setReservationRequests] = useState<ReservationRequest[]>([]);
  const [digitizationRequests, setDigitizationRequests] = useState<DigitizationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate("/digital-library/auth");
      return;
    }

    loadRequests();
  }, [session, navigate]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      // Charger les demandes de réservation
      const { data: reservations, error: reservationsError } = await supabase
        .from("reservations_requests")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (reservationsError) {
        console.error("Error loading reservations:", reservationsError);
      } else {
        setReservationRequests(reservations || []);
      }

      // Charger les demandes de numérisation
      const { data: digitizations, error: digitizationsError } = await supabase
        .from("digitization_requests")
        .select("*")
        .eq("user_id", session?.user?.id)
        .order("created_at", { ascending: false });

      if (digitizationsError) {
        console.error("Error loading digitizations:", digitizationsError);
      } else {
        setDigitizationRequests(digitizations || []);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      en_attente: { label: "En attente", variant: "secondary" },
      approuvee: { label: "Approuvée", variant: "default" },
      refusee: { label: "Refusée", variant: "destructive" },
      annulee: { label: "Annulée", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en_attente":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "approuvee":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "refusee":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mes Demandes</h1>
          <p className="text-muted-foreground">
            Consultez et suivez l'état de vos demandes de réservation et de numérisation
          </p>
        </div>

        <Tabs defaultValue="reservations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Réservations ({reservationRequests.length})
            </TabsTrigger>
            <TabsTrigger value="digitizations" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Numérisations ({digitizationRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            {reservationRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore fait de demande de réservation
                  </p>
                  <Button onClick={() => navigate("/digital-library/collections/books")}>
                    Parcourir la collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reservationRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <CardTitle className="text-lg">{request.document_title}</CardTitle>
                            <CardDescription className="mt-1">
                              {request.document_cote && (
                                <span className="text-xs">Cote: {request.document_cote}</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Date souhaitée:</span>
                          <p className="mt-1">
                            {format(new Date(request.requested_date), "PPP", { locale: fr })} à {request.requested_time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Date de demande:</span>
                          <p className="mt-1">
                            {format(new Date(request.created_at), "PPP", { locale: fr })}
                          </p>
                        </div>
                        {request.comments && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-muted-foreground">Commentaires:</span>
                            <p className="mt-1 text-muted-foreground">{request.comments}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="digitizations">
            {digitizationRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore fait de demande de numérisation
                  </p>
                  <Button onClick={() => navigate("/digital-library/collections/books")}>
                    Parcourir la collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {digitizationRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <CardTitle className="text-lg">{request.document_title}</CardTitle>
                            <CardDescription className="mt-1">
                              {request.document_cote && (
                                <span className="text-xs">Cote: {request.document_cote}</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Nombre de pages:</span>
                          <p className="mt-1">{request.pages_count}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Type d'usage:</span>
                          <p className="mt-1 capitalize">{request.usage_type}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="font-medium text-muted-foreground">Justification:</span>
                          <p className="mt-1 text-muted-foreground">{request.justification}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Date de demande:</span>
                          <p className="mt-1">
                            {format(new Date(request.created_at), "PPP", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
