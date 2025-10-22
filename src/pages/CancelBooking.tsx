import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

const CancelBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "confirming" | "success" | "error">("loading");
  const [booking, setBooking] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setErrorMessage("Lien d'annulation invalide");
      return;
    }

    loadBooking();
  }, [token, email]);

  const loadBooking = async () => {
    try {
      const { data, error } = await supabase
        .from("visits_bookings")
        .select(`
          *,
          visits_slots (
            date,
            heure,
            capacite_max
          )
        `)
        .eq("id", token)
        .eq("email", email)
        .single();

      if (error) throw error;

      if (!data) {
        setStatus("error");
        setErrorMessage("Réservation introuvable");
        return;
      }

      if (data.statut === "annulee") {
        setStatus("error");
        setErrorMessage("Cette réservation a déjà été annulée");
        return;
      }

      // Vérifier si on est à moins de 24h
      const visitDate = new Date(data.visits_slots.date);
      const now = new Date();
      const hoursDiff = (visitDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        setStatus("error");
        setErrorMessage("Vous ne pouvez plus annuler cette réservation (moins de 24h avant la date prévue)");
        return;
      }

      setBooking(data);
      setStatus("confirming");
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setStatus("error");
      setErrorMessage("Une erreur est survenue");
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setStatus("loading");

    try {
      const { error } = await supabase
        .from("visits_bookings")
        .update({ statut: "annulee" })
        .eq("id", token)
        .eq("email", email);

      if (error) throw error;

      setStatus("success");
      toast.success("Votre réservation a été annulée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
      setStatus("error");
      setErrorMessage("Une erreur est survenue lors de l'annulation");
      toast.error("Impossible d'annuler la réservation");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-8">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h2 className="text-2xl font-bold">Chargement...</h2>
            </div>
          )}

          {status === "confirming" && booking && (
            <div className="space-y-6">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Confirmer l'annulation</h2>
                <p className="text-muted-foreground">
                  Êtes-vous sûr de vouloir annuler cette réservation ?
                </p>
              </div>

              <Card className="p-4 bg-muted/50">
                <h3 className="font-semibold mb-3">Détails de la réservation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom :</span>
                    <span className="font-medium">{booking.nom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email :</span>
                    <span className="font-medium">{booking.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date :</span>
                    <span className="font-medium">
                      {new Date(booking.visits_slots.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Heure :</span>
                    <span className="font-medium">{booking.visits_slots.heure.substring(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visiteurs :</span>
                    <span className="font-medium">{booking.nb_visiteurs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Langue :</span>
                    <span className="font-medium capitalize">{booking.langue}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/cultural-activities")}
                >
                  Conserver ma réservation
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancel}
                >
                  Confirmer l'annulation
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Réservation annulée</h2>
                <p className="text-muted-foreground">
                  Votre réservation a été annulée avec succès.
                </p>
              </div>
              <Button onClick={() => navigate("/cultural-activities")}>
                Retour aux activités culturelles
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Erreur</h2>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <Button onClick={() => navigate("/cultural-activities")}>
                Retour aux activités culturelles
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CancelBooking;
