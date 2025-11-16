import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Save, X } from "lucide-react";

interface RentalSpace {
  id: string;
  space_code: string;
  space_name: string;
  space_name_ar: string | null;
  description: string | null;
  capacity: number | null;
  location: string | null;
  is_active: boolean | null;
}

interface AvailabilityPeriod {
  id: string;
  space_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export function SpaceAvailabilityManagement() {
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<RentalSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<RentalSpace | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availabilities, setAvailabilities] = useState<AvailabilityPeriod[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (selectedSpace) {
      loadAvailabilities(selectedSpace.id);
    }
  }, [selectedSpace]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rental_spaces")
        .select("*")
        .order("space_code");

      if (error) throw error;
      setSpaces(data || []);
      if (data && data.length > 0) {
        setSelectedSpace(data[0]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des espaces:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les espaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAvailabilities = async (spaceId: string) => {
    try {
      const { data, error } = await supabase
        .from("space_availabilities")
        .select("*")
        .eq("space_id", spaceId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des disponibilités:", error);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (!selectedSpace || !selectedDate) return;

    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("space_availabilities")
        .upsert({
          space_id: selectedSpace.id,
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          is_available: isAvailable,
        }, {
          onConflict: "space_id,date,start_time",
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Disponibilité enregistrée avec succès",
      });

      loadAvailabilities(selectedSpace.id);
      setDialogOpen(false);
      setStartTime("09:00");
      setEndTime("17:00");
      setIsAvailable(true);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la disponibilité",
        variant: "destructive",
      });
    }
  };

  const getDateAvailability = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return availabilities.filter(a => a.date === dateStr);
  };

  const modifiers = {
    booked: (date: Date) => {
      const periods = getDateAvailability(date);
      return periods.some(p => !p.is_available);
    },
    available: (date: Date) => {
      const periods = getDateAvailability(date);
      return periods.some(p => p.is_available);
    },
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: "hsl(var(--destructive))",
      color: "hsl(var(--destructive-foreground))",
      opacity: 0.7,
    },
    available: {
      backgroundColor: "hsl(var(--primary))",
      color: "hsl(var(--primary-foreground))",
      opacity: 0.3,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        {spaces.map((space) => (
          <Button
            key={space.id}
            variant={selectedSpace?.id === space.id ? "default" : "outline"}
            onClick={() => setSelectedSpace(space)}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {space.space_code} - {space.space_name}
          </Button>
        ))}
      </div>

      {selectedSpace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendrier de disponibilité - {selectedSpace.space_name}
            </CardTitle>
            <CardDescription>
              {selectedSpace.description}
              <div className="mt-2 flex gap-4 text-xs">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--primary))", opacity: 0.3 }}></div>
                  Disponible
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(var(--destructive))", opacity: 0.7 }}></div>
                  Réservé/Indisponible
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Périodes configurées</h3>
                {selectedDate ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
                    </p>
                    {getDateAvailability(selectedDate).length > 0 ? (
                      getDateAvailability(selectedDate).map((period) => (
                        <div
                          key={period.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {period.start_time} - {period.end_time}
                            </span>
                          </div>
                          <Badge variant={period.is_available ? "default" : "destructive"}>
                            {period.is_available ? "Disponible" : "Indisponible"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-4 border rounded-lg">
                        Aucune période configurée pour cette date
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez une date sur le calendrier
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer la disponibilité</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: fr })}
              {" - "}
              {selectedSpace?.space_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Heure de début</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Heure de fin</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isAvailable ? "default" : "outline"}
                  onClick={() => setIsAvailable(true)}
                  className="flex-1"
                >
                  Disponible
                </Button>
                <Button
                  type="button"
                  variant={!isAvailable ? "destructive" : "outline"}
                  onClick={() => setIsAvailable(false)}
                  className="flex-1"
                >
                  Indisponible
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveAvailability}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
