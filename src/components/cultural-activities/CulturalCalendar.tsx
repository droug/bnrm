import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";

interface CalendarEvent {
  id: number;
  title: string;
  type: "cultural" | "exhibition" | "conference" | "workshop";
  date: Date;
  time: string;
  location: string;
  link: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: 1,
    title: "Exposition manuscrits andalous",
    type: "exhibition",
    date: new Date(2025, 9, 15),
    time: "10:00 - 18:00",
    location: "Salle d'exposition principale",
    link: "#"
  },
  {
    id: 2,
    title: "Conférence: Patrimoine numérique",
    type: "conference",
    date: new Date(2025, 9, 22),
    time: "14:00 - 17:00",
    location: "Auditorium",
    link: "#"
  },
  {
    id: 3,
    title: "Atelier calligraphie arabe",
    type: "workshop",
    date: new Date(2025, 9, 28),
    time: "15:00 - 18:00",
    location: "Salle de formation",
    link: "#"
  },
  {
    id: 4,
    title: "Concert de musique andalouse",
    type: "cultural",
    date: new Date(2025, 9, 8),
    time: "19:00 - 21:00",
    location: "Auditorium",
    link: "#"
  },
  {
    id: 5,
    title: "Exposition photographie historique",
    type: "exhibition",
    date: new Date(2025, 9, 12),
    time: "09:00 - 17:00",
    location: "Galerie Est",
    link: "#"
  },
  {
    id: 6,
    title: "Conférence: Architecture marocaine",
    type: "conference",
    date: new Date(2025, 9, 18),
    time: "16:00 - 18:00",
    location: "Salle de conférence",
    link: "#"
  },
  {
    id: 7,
    title: "Atelier enluminure",
    type: "workshop",
    date: new Date(2025, 9, 25),
    time: "10:00 - 13:00",
    location: "Atelier d'art",
    link: "#"
  },
  {
    id: 8,
    title: "Lecture poétique",
    type: "cultural",
    date: new Date(2025, 9, 20),
    time: "18:00 - 20:00",
    location: "Salon littéraire",
    link: "#"
  },
  {
    id: 9,
    title: "Exposition: Trésors de la BNRM",
    type: "exhibition",
    date: new Date(2025, 9, 5),
    time: "10:00 - 18:00",
    location: "Salle des trésors",
    link: "#"
  },
  {
    id: 10,
    title: "Conférence: Préservation des livres anciens",
    type: "conference",
    date: new Date(2025, 9, 30),
    time: "14:00 - 16:00",
    location: "Auditorium",
    link: "#"
  },
  {
    id: 11,
    title: "Atelier reliure traditionnelle",
    type: "workshop",
    date: new Date(2025, 9, 10),
    time: "14:00 - 17:00",
    location: "Atelier de restauration",
    link: "#"
  },
  {
    id: 12,
    title: "Spectacle de conteurs marocains",
    type: "cultural",
    date: new Date(2025, 9, 17),
    time: "19:00 - 21:00",
    location: "Espace culturel",
    link: "#"
  }
];

const getEventColor = (type: CalendarEvent["type"]) => {
  const colors = {
    cultural: "bg-blue-500",
    exhibition: "bg-green-500",
    conference: "bg-orange-500",
    workshop: "bg-purple-500"
  };
  return colors[type];
};

const getEventLabel = (type: CalendarEvent["type"]) => {
  const labels = {
    cultural: "Présentation libre",
    exhibition: "Exposition",
    conference: "Conférence/Débat",
    workshop: "Formation"
  };
  return labels[type];
};

const CulturalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: number) => {
    const dayEvents = mockEvents.filter(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === currentDate.getMonth() &&
      event.date.getFullYear() === currentDate.getFullYear()
    );
    
    // Appliquer le filtre si un type spécifique est sélectionné
    if (filterType === "all") {
      return dayEvents;
    }
    return dayEvents.filter(event => event.type === filterType);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

  return (
    <>
      <Card className="max-w-5xl mx-auto rounded-2xl shadow-lg">
        <CardContent className="p-6">
          {/* Calendar Header with Filter */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <Button
              onClick={goToPreviousMonth}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-[#002B45]">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              {/* Filter Dropdown */}
              <CustomSelect
                value={filterType}
                onValueChange={setFilterType}
                options={[
                  { value: "all", label: "Tous les événements" },
                  { value: "cultural", label: "Présentation libre" },
                  { value: "exhibition", label: "Exposition" },
                  { value: "conference", label: "Conférence/Débat" },
                  { value: "workshop", label: "Formation" },
                ]}
                placeholder="Filtrer par type"
                icon={<Filter className="h-4 w-4 text-[#D4AF37]" />}
                className="w-[220px]"
              />
            </div>
            
            <Button
              onClick={goToNextMonth}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
              <div key={day} className="text-center font-semibold text-[#333333] py-2">
                {day}
              </div>
            ))}

            {/* Empty Days */}
            {emptyDays.map(i => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Calendar Days */}
            {days.map(day => {
              const events = getEventsForDay(day);
              const hasEvents = events.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => hasEvents && setSelectedEvent(events[0])}
                  className={`
                    aspect-square p-2 rounded-xl border-2 transition-all
                    ${hasEvents 
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 cursor-pointer' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-[#002B45] font-semibold">{day}</div>
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {events.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-[#333333]">Présentation libre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-[#333333]">Exposition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-[#333333]">Conférence/Débat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-[#333333]">Formation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#002B45]">Détails de l'événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <Badge className={getEventColor(selectedEvent.type) + " text-white"}>
                {getEventLabel(selectedEvent.type)}
              </Badge>
              <div>
                <h4 className="font-bold text-lg text-[#002B45]">{selectedEvent.title}</h4>
              </div>
              <div className="space-y-2 text-[#333333]">
                <p className="flex items-center gap-2">
                  📅 {selectedEvent.date.toLocaleDateString('fr-FR')}
                </p>
                <p className="flex items-center gap-2">
                  🕐 {selectedEvent.time}
                </p>
                <p className="flex items-center gap-2">
                  📍 {selectedEvent.location}
                </p>
              </div>
              <Button 
                className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl"
                onClick={() => window.open(selectedEvent.link, '_blank')}
              >
                Voir plus →
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CulturalCalendar;
