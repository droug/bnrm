import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, BookOpen, Calendar, User, Building2, Library } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BookReservation {
  id: string;
  document_title: string;
  document_author: string | null;
  document_year: string | null;
  support_type: string;
  support_status: string;
  request_physical: boolean;
  routed_to: string;
  statut: string;
  requested_date: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  soumise: { label: "Soumise", variant: "secondary" },
  en_analyse: { label: "En analyse", variant: "default" },
  en_cours: { label: "En cours", variant: "default" },
  validee: { label: "Validée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
  archivee: { label: "Archivée", variant: "outline" },
};

export default function UserBookReservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchReservations();
  }, [user]);

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
      console.error("Erreur lors de la récupération des réservations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mes réservations d'ouvrages
          </h1>
          <p className="text-muted-foreground">
            Consultez l'historique de vos demandes de réservation
          </p>
        </div>

        {reservations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune réservation</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore effectué de réservation d'ouvrage
              </p>
              <Button onClick={() => navigate("/cbm/notice-example")}>
                Consulter le catalogue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Historique des réservations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date demandée</TableHead>
                      <TableHead>Routage</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de soumission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{reservation.document_title}</p>
                            {reservation.document_author && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {reservation.document_author}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {reservation.request_physical ? (
                              <>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Consultation physique</span>
                              </>
                            ) : (
                              <>
                                <Library className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Numérique</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.requested_date ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(new Date(reservation.requested_date), "dd MMM yyyy", {
                                locale: fr,
                              })}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {reservation.routed_to === "bibliotheque_numerique"
                              ? "Bibliothèque Numérique"
                              : "Responsable Support"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_LABELS[reservation.statut]?.variant || "default"}>
                            {STATUS_LABELS[reservation.statut]?.label || reservation.statut}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(reservation.created_at), "dd/MM/yyyy HH:mm", {
                            locale: fr,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
