import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock, Users, Globe, Info } from "lucide-react";
import { toast } from "sonner";

interface StepSlotSelectionProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const StepSlotSelection = ({ data, onUpdate }: StepSlotSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data.selectedSlot?.date ? new Date(data.selectedSlot.date) : undefined
  );

  // Récupérer les créneaux disponibles pour le mois sélectionné
  const { data: slots, isLoading, error: queryError } = useQuery({
    queryKey: ["visit-slots", selectedDate?.getMonth(), selectedDate?.getFullYear()],
    queryFn: async () => {
      if (!selectedDate) {
        console.log("No date selected");
        return [];
      }
      
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

      console.log("Fetching slots from", format(startOfMonth, "yyyy-MM-dd"), "to", format(endOfMonth, "yyyy-MM-dd"));

      const { data, error } = await supabase
        .from("visits_slots")
        .select("*")
        .gte("date", format(startOfMonth, "yyyy-MM-dd"))
        .lte("date", format(endOfMonth, "yyyy-MM-dd"))
        .order("date", { ascending: true })
        .order("heure", { ascending: true });

      if (error) {
        console.error("Error fetching slots:", error);
        toast.error("Erreur lors du chargement des créneaux: " + error.message);
        throw error;
      }

      console.log("Slots fetched:", data?.length, "slots", data);
      return data || [];
    },
    enabled: !!selectedDate,
  });

  // Filtrer les créneaux pour la date sélectionnée
  const slotsForSelectedDate = slots?.filter(
    (slot) =>
      format(new Date(slot.date), "yyyy-MM-dd") ===
      format(selectedDate || new Date(), "yyyy-MM-dd")
  );

  console.log("Selected date:", selectedDate ? format(selectedDate, "yyyy-MM-dd") : "none");
  console.log("Total slots:", slots?.length);
  console.log("Slots for selected date:", slotsForSelectedDate?.length, slotsForSelectedDate);

  const handleSlotSelect = (slot: any) => {
    const capaciteRestante = slot.capacite_max - slot.reservations_actuelles;
    
    if (slot.statut === "complet" || capaciteRestante <= 0) {
      toast.error("Ce créneau est complet");
      return;
    }

    console.log("Slot selected:", slot);
    
    onUpdate({
      slotId: slot.id,
      selectedSlot: slot,
      langue: slot.langue,
      nbVisiteurs: 1, // Initialiser avec 1 visiteur par défaut
    });

    toast.success("Créneau sélectionné avec succès");
  };

  const getLangueColor = (langue: string) => {
    const colors: Record<string, string> = {
      arabe: "bg-blue-100 text-blue-800 border-blue-300",
      français: "bg-green-100 text-green-800 border-green-300",
      anglais: "bg-purple-100 text-purple-800 border-purple-300",
      amazighe: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[langue] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Désactiver les dates passées
  const isDateDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-light text-[#002B45] mb-2">
          Choisissez votre créneau
        </h2>
        <p className="text-[#002B45]/70 font-light">
          Sélectionnez la date et l'heure de votre visite
        </p>
      </div>

      <Alert className="bg-white/80 border-[#D4AF37]/30">
        <Info className="h-4 w-4 text-[#D4AF37] stroke-1" />
        <AlertDescription className="text-[#002B45]/70 font-light">
          Les visites sont guidées par les équipes de la BNRM et durent environ 45 minutes.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-[#D4AF37]/30 shadow-sm hover:shadow-md transition-all duration-200">
          <h3 className="font-light text-lg mb-6 text-[#002B45] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#D4AF37] stroke-1" />
            Date de la visite
          </h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={fr}
            disabled={isDateDisabled}
            className="rounded-md [&_.rdp-day_selected]:bg-[#D4AF37] [&_.rdp-day_selected]:text-white [&_.rdp-day]:hover:bg-[#D4AF37]/10 [&_.rdp-day]:transition-colors [&_.rdp-day]:font-light"
          />
        </div>

        {/* Créneaux disponibles */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            {selectedDate
              ? `Créneaux pour le ${format(selectedDate, "dd MMMM yyyy", { locale: fr })}`
              : "Sélectionnez une date"}
          </h3>

          {isLoading && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Chargement des créneaux disponibles...
              </AlertDescription>
            </Alert>
          )}

          {queryError && (
            <Alert variant="destructive">
              <AlertDescription>
                Erreur lors du chargement des créneaux. Veuillez réessayer.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !selectedDate && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Veuillez sélectionner une date dans le calendrier pour voir les créneaux disponibles
              </AlertDescription>
            </Alert>
          )}

          {!isLoading &&
            selectedDate &&
            !queryError &&
            slots?.length === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Aucun créneau n'a été créé. Contactez l'administrateur.
                </AlertDescription>
              </Alert>
            )}

          {!isLoading &&
            selectedDate &&
            !queryError &&
            slots &&
            slots.length > 0 &&
            slotsForSelectedDate?.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
                </AlertDescription>
              </Alert>
            )}

          <div className="space-y-3">
            {slotsForSelectedDate?.map((slot) => {
              const capaciteRestante = slot.capacite_max - slot.reservations_actuelles;
              const isComplet = slot.statut === "complet" || capaciteRestante <= 0;
              const isSelected = data.slotId === slot.id;

              return (
                <Card
                  key={slot.id}
                  className={`p-4 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "ring-2 ring-primary shadow-md"
                      : isComplet
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => !isComplet && handleSlotSelect(slot)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {slot.heure.substring(0, 5)}
                        </span>
                      </div>
                      <Badge className={getLangueColor(slot.langue)}>
                        <Globe className="h-3 w-3 mr-1" />
                        {slot.langue}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {capaciteRestante > 0
                          ? `${capaciteRestante} places`
                          : "Complet"}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <p className="text-xs text-primary mt-2">✓ Créneau sélectionné</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepSlotSelection;
