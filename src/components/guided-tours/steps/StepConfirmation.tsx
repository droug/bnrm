import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Clock, Globe, Users, Mail, Phone, Building, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface StepConfirmationProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StepConfirmation = ({ data }: StepConfirmationProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();

      const { data: booking, error } = await supabase
        .from("visits_bookings")
        .insert({
          slot_id: data.slotId,
          user_id: userData?.user?.id || null,
          nom: data.nom,
          email: data.email,
          telephone: data.telephone,
          organisme: data.organisme || null,
          nb_visiteurs: data.nbVisiteurs,
          langue: data.langue,
          commentaire: data.commentaire || null,
          statut: "en_attente",
        })
        .select()
        .single();

      if (error) throw error;

      // Appeler l'edge function pour envoyer l'email de confirmation
      const { error: emailError } = await supabase.functions.invoke(
        "send-visit-confirmation",
        {
          body: {
            bookingId: booking.id,
            email: data.email,
            nom: data.nom,
            slotDate: data.selectedSlot.date,
            slotTime: data.selectedSlot.heure,
            langue: data.langue,
            nbVisiteurs: data.nbVisiteurs,
          },
        }
      );

      if (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
        // Ne pas bloquer la réservation si l'email échoue
      }

      return booking;
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Votre réservation a été enregistrée avec succès!");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la réservation:", error);
      
      if (error.message?.includes("2 réservations actives")) {
        toast.error("Vous avez déjà 2 réservations actives. Veuillez annuler une réservation existante.");
      } else {
        toast.error("Une erreur est survenue lors de la réservation. Veuillez réessayer.");
      }
    },
  });

  const handleConfirm = () => {
    if (!isConfirmed) {
      toast.error("Veuillez confirmer votre participation");
      return;
    }
    createBookingMutation.mutate();
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="bg-green-100 rounded-full p-6">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Votre réservation de visite guidée a été enregistrée
          </h2>
          <p className="text-muted-foreground text-lg">
            Vous recevrez un email de confirmation sous peu.
          </p>
        </div>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h3 className="font-semibold text-lg mb-4 flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Détails de votre visite
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {format(new Date(data.selectedSlot.date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Heure</p>
                <p className="font-semibold">{data.selectedSlot.heure.substring(0, 5)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Langue</p>
                <p className="font-semibold capitalize">{data.langue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Visiteurs</p>
                <p className="font-semibold">{data.nbVisiteurs}</p>
              </div>
            </div>
          </div>
        </Card>

        <Alert className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <Mail className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <p className="font-medium mb-1">📧 Email de confirmation en cours d'envoi</p>
            <p className="text-sm">
              Un email contenant un <strong>fichier PDF récapitulatif avec le logo BNRM</strong> et toutes les informations de votre visite sera envoyé à : <strong>{data.email}</strong>
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-left">
          <p className="font-medium mb-2">📋 Rappel :</p>
          <ul className="space-y-1 text-muted-foreground ml-4">
            <li>• Présentez le PDF de confirmation à l'accueil le jour de votre visite</li>
            <li>• Arrivez 10 minutes avant l'heure prévue</li>
            <li>• Durée de la visite : environ 45 minutes</li>
          </ul>
        </div>

        <Button 
          onClick={() => navigate("/cultural-activities")}
          size="lg"
          className="w-full rounded-2xl"
        >
          Retour aux activités culturelles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Récapitulatif de votre réservation
        </h2>
        <p className="text-muted-foreground">
          Veuillez vérifier les informations avant de confirmer
        </p>
      </div>

      <div className="grid gap-4">
        {/* Informations du créneau */}
        <Card className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10">
          <h3 className="font-semibold text-lg mb-4 text-primary">
            Détails de la visite
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-semibold">
                  {format(new Date(data.selectedSlot.date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Heure</p>
                <p className="font-semibold">
                  {data.selectedSlot.heure.substring(0, 5)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Langue</p>
                <p className="font-semibold capitalize">{data.langue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre de visiteurs</p>
                <p className="font-semibold">{data.nbVisiteurs}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informations du visiteur */}
        <Card className="p-6 rounded-2xl">
          <h3 className="font-semibold text-lg mb-4">Vos informations</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <p className="font-medium">{data.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{data.telephone}</p>
              </div>
            </div>
            {data.organisme && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Organisme</p>
                  <p className="font-medium">{data.organisme}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Confirmation */}
      <Card className="p-6 rounded-2xl bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Checkbox 
            id="confirmation"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="confirmation" className="text-sm cursor-pointer">
            Je confirme ma participation à cette visite guidée et j'ai pris connaissance que les visites durent environ 45 minutes.
          </label>
        </div>
      </Card>

      <Button
        onClick={handleConfirm}
        disabled={!isConfirmed || createBookingMutation.isPending}
        size="lg"
        className="w-full rounded-2xl"
      >
        {createBookingMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Confirmation en cours...
          </>
        ) : (
          "Confirmer la réservation"
        )}
      </Button>
    </div>
  );
};

export default StepConfirmation;
