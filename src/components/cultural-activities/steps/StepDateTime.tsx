import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, Users, Trash2, Plus, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingData, EventSlot } from "../BookingWizard";

interface StepDateTimeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepDateTime({ data, onUpdate }: StepDateTimeProps) {
  const [slots, setSlots] = useState<EventSlot[]>(data.eventSlots || []);

  // Récupérer les infos de l'espace sélectionné
  const { data: selectedSpace } = useQuery({
    queryKey: ['cultural-space', data.spaceId],
    queryFn: async () => {
      if (!data.spaceId) return null;
      const { data: space, error } = await supabase
        .from('cultural_spaces')
        .select('*')
        .eq('id', data.spaceId)
        .single();
      
      if (error) throw error;
      return space;
    },
    enabled: !!data.spaceId
  });

  // Synchroniser les slots avec les données du formulaire
  useEffect(() => {
    onUpdate({ eventSlots: slots });
  }, [slots]);

  // Ajouter un nouveau créneau
  const addSlot = () => {
    if (slots.length >= 10) {
      toast.error("Maximum 10 créneaux autorisés");
      return;
    }

    const newSlot: EventSlot = {
      id: `slot-${Date.now()}`,
      date: new Date(),
      startTime: "09:00",
      endTime: "18:00",
      participants: 1
    };

    setSlots([...slots, newSlot]);
    toast.success("Créneau ajouté");
  };

  // Supprimer un créneau
  const removeSlot = (id: string) => {
    if (slots.length === 1) {
      toast.error("Au moins un créneau est requis");
      return;
    }

    setSlots(slots.filter(slot => slot.id !== id));
    toast.success("Créneau supprimé");
  };

  // Mettre à jour un créneau
  const updateSlot = (id: string, updates: Partial<EventSlot>) => {
    setSlots(slots.map(slot => 
      slot.id === id ? { ...slot, ...updates } : slot
    ));
  };

  // Vérifier les chevauchements
  const checkOverlaps = (currentSlot: EventSlot): boolean => {
    for (const slot of slots) {
      if (slot.id === currentSlot.id) continue;
      
      // Même date
      if (format(slot.date, 'yyyy-MM-dd') === format(currentSlot.date, 'yyyy-MM-dd')) {
        const slotStart = slot.startTime;
        const slotEnd = slot.endTime;
        const currentStart = currentSlot.startTime;
        const currentEnd = currentSlot.endTime;
        
        // Vérifier le chevauchement
        if (
          (currentStart < slotEnd && currentEnd > slotStart) ||
          (slotStart < currentEnd && slotEnd > currentStart)
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Calculer le total de participants
  const totalParticipants = slots.reduce((sum, slot) => sum + (slot.participants || 0), 0);

  // Validation de la capacité
  const capacityError = selectedSpace && totalParticipants > selectedSpace.capacity;

  // Validation des dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Trier les créneaux par date et heure
  const sortedSlots = [...slots].sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Détails de l'événement</h2>
        <p className="text-muted-foreground">
          Renseignez les informations détaillées sur votre événement
        </p>
      </div>

      {/* Titre de l'événement */}
      <div className="space-y-2">
        <Label htmlFor="eventTitle">Titre de l'événement *</Label>
        <Input
          id="eventTitle"
          placeholder="Ex: Festival du livre africain"
          value={data.eventTitle || ""}
          onChange={(e) => onUpdate({ eventTitle: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="eventDescription">Description *</Label>
        <Textarea
          id="eventDescription"
          placeholder="Décrivez votre événement, son objectif, son déroulement prévu..."
          value={data.eventDescription || ""}
          onChange={(e) => onUpdate({ eventDescription: e.target.value })}
          rows={4}
          required
        />
      </div>

      {/* Section Créneaux */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#D4AF37]" />
              Créneaux de l'événement
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Ajoutez les différents créneaux prévus pour votre événement
            </p>
          </div>
          <Button
            type="button"
            onClick={addSlot}
            disabled={slots.length >= 10}
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un créneau
          </Button>
        </div>

        {/* Liste des créneaux */}
        <div className="space-y-4">
          {sortedSlots.map((slot, index) => {
            const hasOverlap = checkOverlaps(slot);
            const isIncomplete = !slot.date || !slot.startTime || !slot.endTime;
            
            return (
              <Card key={slot.id} className="p-4 bg-[#FAFAFA] border-[#DDD]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-[#002B45]">Créneau {index + 1}</h4>
                    {slots.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(slot.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Date *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal h-11",
                              !slot.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {slot.date ? (
                              format(slot.date, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0" 
                          align="start"
                          style={{ zIndex: 9999 }}
                        >
                          <Calendar
                            mode="single"
                            selected={slot.date}
                            onSelect={(date) => date && updateSlot(slot.id, { date })}
                            disabled={(date) => date < today}
                            initialFocus
                            locale={fr}
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Heure de début */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Heure de début *
                      </Label>
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Heure de fin */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Heure de fin *
                      </Label>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>
                  </div>

                  {/* Nombre de participants */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Nombre de participants *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={slot.participants}
                      onChange={(e) => updateSlot(slot.id, { participants: parseInt(e.target.value) || 1 })}
                      placeholder="Ex: 50"
                      required
                    />
                  </div>

                  {/* Alertes */}
                  {isIncomplete && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Veuillez compléter toutes les informations du créneau.
                      </AlertDescription>
                    </Alert>
                  )}

                  {hasOverlap && !isIncomplete && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Deux créneaux ne peuvent pas se superposer dans le temps.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Total de participants */}
        {slots.length > 0 && (
          <Card className="p-4 bg-[#D4AF37]/5 border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#D4AF37]" />
                <span className="font-semibold text-[#002B45]">Total prévu :</span>
              </div>
              <span className="text-2xl font-bold text-[#D4AF37]">
                {totalParticipants} {totalParticipants > 1 ? "personnes" : "personne"}
              </span>
            </div>
            {selectedSpace && (
              <p className="text-sm text-muted-foreground mt-2">
                Capacité de l'espace : {selectedSpace.capacity} personnes
              </p>
            )}
            {capacityError && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Le nombre total de participants ({totalParticipants}) dépasse la capacité de l'espace sélectionné ({selectedSpace?.capacity} personnes).
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}
      </div>

      {/* Upload du programme */}
      <div className="space-y-2">
        <Label htmlFor="program">Programme de l'événement (PDF, Word) *</Label>
        <Input
          id="program"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              ];
              
              if (!validTypes.includes(file.type)) {
                toast.error("Format non supporté. Veuillez utiliser PDF ou Word");
                e.target.value = '';
                return;
              }
              
              if (file.size > 10 * 1024 * 1024) {
                toast.error("Le fichier ne doit pas dépasser 10 MB");
                e.target.value = '';
                return;
              }
              
              onUpdate({ programDocument: file });
              toast.success("Programme ajouté");
            }
          }}
          className="cursor-pointer"
          required
        />
        {data.programDocument && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Fichier ajouté: {(data.programDocument as File).name}</span>
          </div>
        )}
        {!data.programDocument && (
          <p className="text-sm text-muted-foreground">
            Veuillez télécharger le programme de votre événement
          </p>
        )}
      </div>
    </div>
  );
}
