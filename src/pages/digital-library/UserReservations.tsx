import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, FileText, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReservationRequest {
  id: string;
  document_title: string;
  document_cote: string | null;
  statut: string;
  requested_date: string | null;
  created_at: string;
  updated_at: string;
  reason_refus: string | null;
  routed_to: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  soumise: { label: "Soumise", variant: "secondary" },
  en_cours: { label: "En cours", variant: "outline" },
  validee: { label: "Validée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
  archivee: { label: "Archivée", variant: "outline" },
};

export default function UserReservations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchReservations();
  }, [user, navigate]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("reservations_ouvrages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de vos réservations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Mes Demandes de Réservation</CardTitle>
              <CardDescription>
                Historique de vos demandes de réservation de documents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reservations.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Vous n'avez pas encore fait de demande de réservation.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Document
                      </div>
                    </TableHead>
                    <TableHead>Cote</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date souhaitée
                      </div>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Routage</TableHead>
                    <TableHead>Date de demande</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => {
                    const statusInfo = STATUS_LABELS[reservation.statut] || STATUS_LABELS.soumise;
                    
                    return (
                      <TableRow 
                        key={reservation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/digital-library/reservation/${reservation.id}`)}
                      >
                        <TableCell className="font-medium">
                          {reservation.document_title}
                        </TableCell>
                        <TableCell>
                          {reservation.document_cote ? (
                            <span className="font-mono text-primary">{reservation.document_cote}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {reservation.requested_date ? (
                            format(new Date(reservation.requested_date), "PPP", { locale: fr })
                          ) : (
                            <span className="text-muted-foreground">Non spécifiée</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {reservation.routed_to === "bibliotheque_numerique" ? "BN" : "Support"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(reservation.created_at), "PPP", { locale: fr })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
