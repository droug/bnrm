import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

export default function CulturalCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock events data - this would come from the database in a real implementation
  const events = [
    {
      id: 1,
      title: "Exposition de manuscrits anciens",
      date: new Date(2025, 9, 25),
      time: "10:00 - 18:00",
      location: "Salle d'exposition",
      type: "Exposition",
    },
    {
      id: 2,
      title: "Conférence sur le patrimoine marocain",
      date: new Date(2025, 9, 28),
      time: "14:00 - 17:00",
      location: "Auditorium",
      type: "Conférence",
    },
    {
      id: 3,
      title: "Atelier de calligraphie",
      date: new Date(2025, 10, 2),
      time: "09:00 - 12:00",
      location: "Salle de formation",
      type: "Atelier",
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
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "Conférence":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "Atelier":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
          <CardDescription>
            Sélectionnez une date pour voir les événements
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
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

      <Card>
        <CardHeader>
          <CardTitle>
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
                  className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
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
  );
}
