import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: "cultural" | "exhibition" | "conference" | "workshop";
  description: string;
}

const mockEvents: Event[] = [
  {
    id: 1,
    title: "Exposition du patrimoine manuscrit marocain",
    date: "15 Janvier 2025",
    location: "Salle d'exposition principale",
    image: "/placeholder.svg",
    category: "exhibition",
    description: "Découvrez les trésors manuscrits du Maroc"
  },
  {
    id: 2,
    title: "Conférence : La numérisation du patrimoine",
    date: "22 Janvier 2025",
    location: "Auditorium",
    image: "/placeholder.svg",
    category: "conference",
    description: "Les enjeux de la préservation numérique"
  },
  {
    id: 3,
    title: "Atelier de calligraphie arabe",
    date: "28 Janvier 2025",
    location: "Salle de formation",
    image: "/placeholder.svg",
    category: "workshop",
    description: "Initiation à l'art de la calligraphie"
  },
  {
    id: 4,
    title: "Soirée culturelle : Poésie marocaine",
    date: "5 Février 2025",
    location: "Espace culturel",
    image: "/placeholder.svg",
    category: "cultural",
    description: "Célébration de la poésie marocaine contemporaine"
  },
  {
    id: 5,
    title: "Table ronde : Bibliothèques et société",
    date: "12 Février 2025",
    location: "Salle de conférence",
    image: "/placeholder.svg",
    category: "conference",
    description: "Le rôle des bibliothèques dans la société moderne"
  }
];

const getCategoryColor = (category: Event["category"]) => {
  const colors = {
    cultural: "bg-blue-500",
    exhibition: "bg-green-500",
    conference: "bg-orange-500",
    workshop: "bg-purple-500"
  };
  return colors[category];
};

const getCategoryLabel = (category: Event["category"]) => {
  const labels = {
    cultural: "Activité culturelle",
    exhibition: "Exposition",
    conference: "Conférence",
    workshop: "Atelier"
  };
  return labels[category];
};

const EventsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockEvents.length) % mockEvents.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
  };

  const displayedEvents = [
    mockEvents[currentIndex],
    mockEvents[(currentIndex + 1) % mockEvents.length],
    mockEvents[(currentIndex + 2) % mockEvents.length]
  ];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedEvents.map((event, idx) => (
          <Card 
            key={event.id} 
            className={`overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ${
              idx === 0 ? 'md:scale-105' : 'md:scale-95 opacity-90'
            }`}
          >
            <div className="relative h-48 bg-gradient-to-br from-[#002B45] to-[#004d7a]">
              <div className="absolute inset-0 flex items-center justify-center text-white text-6xl opacity-20">
                📅
              </div>
              <Badge 
                className={`absolute top-4 right-4 ${getCategoryColor(event.category)} text-white`}
              >
                {getCategoryLabel(event.category)}
              </Badge>
            </div>
            <CardContent className="p-6 space-y-3">
              <h3 className="text-lg font-bold text-[#002B45] line-clamp-2">
                {event.title}
              </h3>
              <p className="text-sm text-[#333333] line-clamp-2">
                {event.description}
              </p>
              <div className="space-y-2 text-sm text-[#333333]">
                <p className="flex items-center gap-2">
                  📅 {event.date}
                </p>
                <p className="flex items-center gap-2">
                  📍 {event.location}
                </p>
              </div>
              <Button 
                className="w-full bg-[#D4AF37] hover:bg-[#b8941f] text-white rounded-2xl"
              >
                Découvrir →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={goToPrevious}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          onClick={goToNext}
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {mockEvents.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? 'bg-[#D4AF37] w-8' 
                : 'bg-[#D4AF37]/30'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventsCarousel;
