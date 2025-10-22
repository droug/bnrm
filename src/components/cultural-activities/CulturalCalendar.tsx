import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: Date;
  time: string;
  location: string;
  type: string;
  description?: string;
  link?: string;
}

export default function CulturalCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock events data - this would come from the database in a real implementation
  const events: Event[] = [
    {
      id: 1,
      title: "Exposition de manuscrits anciens",
      date: new Date(2025, 9, 25),
      time: "10:00 - 18:00",
      location: "Salle d'exposition",
      type: "Exposition",
      description: "Découvrez notre collection exceptionnelle de manuscrits rares et précieux.",
      link: "/cultural-activities/event/1",
    },
    {
      id: 2,
      title: "Conférence sur le patrimoine marocain",
      date: new Date(2025, 9, 28),
      time: "14:00 - 17:00",
      location: "Auditorium",
      type: "Conférence",
      description: "Une exploration approfondie de la richesse culturelle du Maroc.",
      link: "/cultural-activities/event/2",
    },
    {
      id: 3,
      title: "Atelier de calligraphie",
      date: new Date(2025, 10, 2),
      time: "09:00 - 12:00",
      location: "Salle de formation",
      type: "Atelier",
      description: "Initiez-vous à l'art ancestral de la calligraphie arabe.",
      link: "/cultural-activities/event/3",
    },
  ];

  // Get events for the selected date
  const selectedDateEvents = events.filter(
    (event) =>
      date &&
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
  );

  // Dates that have events
  const eventDates = events.map((event) => event.date);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Exposition":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50";
      case "Conférence":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50";
      case "Atelier":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50";
      case "Activité culturelle":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50";
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Calendrier</CardTitle>
            <CardDescription>
              Sélectionnez une date pour voir les événements
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-2xl border"
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">
              {date ? date.toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "Sélectionnez une date"}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} événement(s) prévu(s)`
                : "Aucun événement prévu"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border rounded-2xl hover:bg-accent/10 transition-all duration-300 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                      <Badge className={`${getEventTypeColor(event.type)} border`}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-accent-foreground" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent-foreground" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun événement prévu pour cette date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <Badge className={`${getEventTypeColor(selectedEvent?.type || "")} border mt-2`}>
                {selectedEvent?.type}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedEvent?.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent-foreground" />
                <span>{selectedEvent?.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-foreground" />
                <span>{selectedEvent?.location}</span>
              </div>
            </div>
            {selectedEvent?.link && (
              <Button className="w-full rounded-2xl" asChild>
                <a href={selectedEvent.link}>
                  Voir plus
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
