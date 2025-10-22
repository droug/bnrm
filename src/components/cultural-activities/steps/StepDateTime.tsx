import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BookingData } from "../BookingWizard";

interface StepDateTimeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepDateTime({ data, onUpdate }: StepDateTimeProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

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

  const handleProgramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Validation de la capacité
  const capacityError = selectedSpace && data.expectedAttendees && 
    data.expectedAttendees > selectedSpace.capacity;

  // Validation des dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

      {/* Dates de début et fin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date de début */}
        <div className="space-y-2">
          <Label>Date de début *</Label>
          <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !data.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.startDate ? (
                  format(data.startDate, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start" 
              side="bottom" 
              sideOffset={8}
              avoidCollisions={true}
              collisionPadding={20}
              style={{ zIndex: 9999 }}
            >
              <Calendar
                mode="single"
                selected={data.startDate}
                onSelect={(date) => {
                  onUpdate({ startDate: date });
                  setStartDateOpen(false);
                }}
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
          <Label htmlFor="startTime">Heure de début *</Label>
          <Input
            id="startTime"
            type="time"
            value={data.startTime || ""}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date de fin */}
        <div className="space-y-2">
          <Label>Date de fin *</Label>
          <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !data.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.endDate ? (
                  format(data.endDate, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align="start" 
              side="bottom" 
              sideOffset={8}
              avoidCollisions={true}
              collisionPadding={20}
              style={{ zIndex: 9999 }}
            >
              <Calendar
                mode="single"
                selected={data.endDate}
                onSelect={(date) => {
                  onUpdate({ endDate: date });
                  setEndDateOpen(false);
                }}
                disabled={(date) => {
                  if (date < today) return true;
                  if (data.startDate && date < data.startDate) return true;
                  return false;
                }}
                initialFocus
                locale={fr}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Heure de fin */}
        <div className="space-y-2">
          <Label htmlFor="endTime">Heure de fin *</Label>
          <Input
            id="endTime"
            type="time"
            value={data.endTime || ""}
            onChange={(e) => onUpdate({ endTime: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Nombre de participants */}
      <div className="space-y-2">
        <Label htmlFor="expectedAttendees">Nombre de participants *</Label>
        <Input
          id="expectedAttendees"
          type="number"
          min="1"
          placeholder="Ex: 50"
          value={data.expectedAttendees || ""}
          onChange={(e) => onUpdate({ expectedAttendees: parseInt(e.target.value) || 0 })}
          required
          className={capacityError ? "border-destructive" : ""}
        />
        {selectedSpace && (
          <p className="text-sm text-muted-foreground">
            Capacité de l'espace : {selectedSpace.capacity} personnes
          </p>
        )}
        {capacityError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Le nombre de participants ({data.expectedAttendees}) dépasse la capacité de l'espace sélectionné ({selectedSpace?.capacity} personnes).
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Upload du programme */}
      <div className="space-y-2">
        <Label htmlFor="program">Programme de l'événement (PDF, Word)</Label>
        <Input
          id="program"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleProgramUpload}
          className="cursor-pointer"
        />
        {data.programDocument && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Fichier ajouté: {(data.programDocument as File).name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
