import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

export function AvailabilityCalendar({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      fetchReservedDates();
    }
  }, [isOpen, documentId]);

  const fetchReservedDates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations_ouvrages")
        .select("requested_date")
        .eq("document_id", documentId)
        .in("statut", ["en_attente", "valide"])
        .not("requested_date", "is", null);

      if (error) throw error;

      const dates = data
        .map((item) => item.requested_date ? new Date(item.requested_date) : null)
        .filter((date): date is Date => date !== null);

      setReservedDates(dates);
    } catch (error) {
      console.error("Erreur lors du chargement des dates réservées:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dates réservées",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isDateReserved = (date: Date) => {
    return reservedDates.some(
      (reservedDate) =>
        format(reservedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const modifiers = {
    reserved: reservedDates,
  };

  const modifiersStyles = {
    reserved: {
      backgroundColor: "hsl(var(--muted))",
      color: "hsl(var(--muted-foreground))",
      opacity: 0.5,
      cursor: "not-allowed",
    },
  };

  const handleDayClick = (date: Date | undefined) => {
    if (date && !isDateReserved(date)) {
      setSelectedDate(date);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Disponibilité - {documentTitle}</DialogTitle>
          <DialogDescription>
            Les dates en gris sont déjà réservées. Sélectionnez une date disponible.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              locale={fr}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today || isDateReserved(date);
              }}
              className="rounded-md border"
            />

            {selectedDate && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium">
                  Date sélectionnée : {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cette date est disponible pour la réservation
                </p>
              </div>
            )}

            {reservedDates.length === 0 && (
              <div className="rounded-lg bg-accent p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucune réservation en cours pour ce document
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
