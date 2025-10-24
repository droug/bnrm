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

  // Vérification de sécurité
  if (!data?.selectedSlot) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-800">
          Erreur : Aucun créneau sélectionné. Veuillez retourner à l'étape précédente.
        </AlertDescription>
      </Alert>
    );
  }

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

      if (error) {
        // Messages d'erreur personnalisés
        if (error.message?.includes("capacité maximale")) {
          throw new Error("CAPACITY_EXCEEDED");
        }
        if (error.message?.includes("2 réservations actives")) {
          throw new Error("MAX_BOOKINGS_REACHED");
        }
        throw error;
      }

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
      
      if (error.message === "CAPACITY_EXCEEDED") {
        toast.error("Le nombre de visiteurs demandé dépasse la capacité restante du créneau. Veuillez choisir un autre créneau ou réduire le nombre de visiteurs.");
      } else if (error.message === "MAX_BOOKINGS_REACHED") {
        toast.error("Vous avez déjà 2 réservations actives. Veuillez annuler une réservation existante avant d'en créer une nouvelle.");
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
      <div className="text-center space-y-6 py-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="bg-green-50 border-2 border-green-200 rounded-full p-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 stroke-1" />
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-light text-[#002B45] mb-3">
            Votre réservation de visite guidée a été enregistrée
          </h2>
          <p className="text-[#002B45]/70 text-lg font-light">
            Vous recevrez un email de confirmation sous peu.
          </p>
        </div>

        <Card className="p-6 bg-white/80 border-[#D4AF37]/30 text-left max-w-xl mx-auto">
          <h3 className="font-light text-lg mb-4 flex items-center justify-center gap-2 text-[#002B45]">
            <Clock className="h-5 w-5 text-[#D4AF37] stroke-1" />
            Détails de votre visite
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#D4AF37]/60 stroke-1" />
              <div>
                <p className="text-xs text-[#002B45]/50 font-light">Date</p>
                <p className="font-light text-[#002B45]">
                  {format(new Date(data.selectedSlot.date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#D4AF37]/60 stroke-1" />
              <div>
                <p className="text-xs text-[#002B45]/50 font-light">Heure</p>
                <p className="font-light text-[#002B45]">{data.selectedSlot.heure.substring(0, 5)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#D4AF37]/60 stroke-1" />
              <div>
                <p className="text-xs text-[#002B45]/50 font-light">Langue</p>
                <p className="font-light text-[#002B45] capitalize">{data.langue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#D4AF37]/60 stroke-1" />
              <div>
                <p className="text-xs text-[#002B45]/50 font-light">Visiteurs</p>
                <p className="font-light text-[#002B45]">{data.nbVisiteurs}</p>
              </div>
            </div>
          </div>
        </Card>

        <Alert className="bg-[#D4AF37]/5 border-[#D4AF37]/30 max-w-xl mx-auto animate-fade-in">
          <Mail className="h-5 w-5 text-[#D4AF37]" />
          <AlertDescription className="text-[#002B45] font-light">
            <p className="font-normal mb-1">📧 Email de confirmation en cours d'envoi</p>
            <p className="text-sm">
              Un email contenant un <strong>fichier PDF récapitulatif avec le logo BNRM</strong> vous sera envoyé à : <strong>{data.email}</strong>
            </p>
          </AlertDescription>
        </Alert>

        <div className="bg-white/50 rounded-xl p-4 text-sm text-left max-w-xl mx-auto border border-[#D4AF37]/20">
          <p className="font-normal mb-2 text-[#002B45]">📋 Rappel :</p>
          <ul className="space-y-1 text-[#002B45]/60 font-light ml-4">
            <li>• Présentez le PDF à l'accueil le jour de votre visite</li>
            <li>• Arrivez 10 minutes avant l'heure prévue</li>
            <li>• Durée de la visite : environ 45 minutes</li>
          </ul>
        </div>

        <Button 
          onClick={() => navigate("/cultural-activities")}
          size="lg"
          className="w-full max-w-md mx-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 font-light"
        >
          Retour aux activités culturelles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-light text-[#002B45] mb-2">
          Récapitulatif de votre réservation
        </h2>
        <p className="text-[#002B45]/70 font-light">
          Veuillez vérifier les informations avant de confirmer
        </p>
      </div>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {/* Informations du créneau */}
        <Card className="p-6 bg-white/80 border-[#D4AF37]/30">
          <h3 className="font-light text-lg mb-4 text-[#002B45]">
            Détails de la visite
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Date</p>
                <p className="font-light text-[#002B45]">
                  {format(new Date(data.selectedSlot.date), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Heure</p>
                <p className="font-light text-[#002B45]">
                  {data.selectedSlot.heure.substring(0, 5)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Langue</p>
                <p className="font-light text-[#002B45] capitalize">{data.langue}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Nombre de visiteurs</p>
                <p className="font-light text-[#002B45]">{data.nbVisiteurs}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informations du visiteur */}
        <Card className="p-6 bg-white/80 border-[#002B45]/10">
          <h3 className="font-light text-lg mb-4 text-[#002B45]">Vos informations</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full" />
              </div>
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Nom</p>
                <p className="font-light text-[#002B45]">{data.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Email</p>
                <p className="font-light text-[#002B45]">{data.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#002B45]/40 stroke-1" />
              <div>
                <p className="text-sm text-[#002B45]/50 font-light">Téléphone</p>
                <p className="font-light text-[#002B45]">{data.telephone}</p>
              </div>
            </div>
            {data.organisme && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-[#002B45]/40 stroke-1" />
                <div>
                  <p className="text-sm text-[#002B45]/50 font-light">Organisme</p>
                  <p className="font-light text-[#002B45]">{data.organisme}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Confirmation */}
      <Card className="p-6 bg-[#D4AF37]/5 border-[#D4AF37]/30 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <Checkbox 
            id="confirmation"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
            className="mt-1 border-[#D4AF37] data-[state=checked]:bg-[#D4AF37]"
          />
          <label htmlFor="confirmation" className="text-sm cursor-pointer font-light text-[#002B45]">
            Je confirme ma participation à cette visite guidée et j'ai pris connaissance que les visites durent environ 45 minutes.
          </label>
        </div>
      </Card>

      <Button
        onClick={handleConfirm}
        disabled={!isConfirmed || createBookingMutation.isPending}
        size="lg"
        className="w-full max-w-md mx-auto bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 font-light"
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
