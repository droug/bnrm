import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { BookingData } from "../BookingWizard";

interface StepDateTimeProps {
  data: BookingData;
  onUpdate: (data: Partial<BookingData>) => void;
  onNext: () => void;
}

export default function StepDateTime({ data, onUpdate }: StepDateTimeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Date et horaires</h2>
        <p className="text-muted-foreground">
          Définissez la date et les horaires de votre événement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Date de l'événement *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.eventDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.eventDate ? (
                  format(data.eventDate, "PPP", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.eventDate}
                onSelect={(date) => onUpdate({ eventDate: date })}
                disabled={(date) => date < new Date()}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedAttendees">Nombre de participants estimé *</Label>
          <Input
            id="expectedAttendees"
            type="number"
            min="1"
            placeholder="Ex: 50"
            value={data.expectedAttendees || ""}
            onChange={(e) => onUpdate({ expectedAttendees: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startTime">Heure de début *</Label>
          <Input
            id="startTime"
            type="time"
            value={data.startTime || ""}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">Heure de fin *</Label>
          <Input
            id="endTime"
            type="time"
            value={data.endTime || ""}
            onChange={(e) => onUpdate({ endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventType">Type d'événement *</Label>
        <Input
          id="eventType"
          placeholder="Ex: Conférence, Exposition, Spectacle, Atelier..."
          value={data.eventType || ""}
          onChange={(e) => onUpdate({ eventType: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventTitle">Titre de l'événement *</Label>
        <Input
          id="eventTitle"
          placeholder="Ex: Festival du livre africain"
          value={data.eventTitle || ""}
          onChange={(e) => onUpdate({ eventTitle: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDescription">Description de l'événement *</Label>
        <Textarea
          id="eventDescription"
          placeholder="Décrivez votre événement, son objectif, son déroulement prévu..."
          value={data.eventDescription || ""}
          onChange={(e) => onUpdate({ eventDescription: e.target.value })}
          rows={4}
        />
      </div>
    </div>
  );
}
