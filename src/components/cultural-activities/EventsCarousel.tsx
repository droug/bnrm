import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useState } from "react";

export default function EventsCarousel() {
  const [api, setApi] = useState<CarouselApi>();

  // Mock upcoming events - this would come from the database in a real implementation
  const upcomingEvents = [
    {
      id: 1,
      title: "Exposition de manuscrits anciens",
      description: "Découvrez notre collection exceptionnelle de manuscrits rares",
      date: "25 Octobre 2025",
      location: "Salle d'exposition",
      image: "/placeholder.svg",
      category: "Exposition",
      link: "/cultural-activities/event/1",
    },
    {
      id: 2,
      title: "Conférence sur le patrimoine marocain",
      description: "Une exploration de la richesse culturelle du Maroc",
      date: "28 Octobre 2025",
      location: "Auditorium",
      image: "/placeholder.svg",
      category: "Conférence",
      link: "/cultural-activities/event/2",
    },
    {
      id: 3,
      title: "Atelier de calligraphie arabe",
      description: "Initiez-vous à l'art ancestral de la calligraphie",
      date: "2 Novembre 2025",
      location: "Salle de formation",
      image: "/placeholder.svg",
      category: "Atelier",
      link: "/cultural-activities/event/3",
    },
    {
      id: 4,
      title: "Projection de documentaire",
      description: "Histoire de la bibliothèque nationale du Royaume du Maroc",
      date: "5 Novembre 2025",
      location: "Auditorium",
      image: "/placeholder.svg",
      category: "Projection",
      link: "/cultural-activities/event/4",
    },
    {
      id: 5,
      title: "Concert de musique andalouse",
      description: "Soirée musicale avec l'orchestre national",
      date: "10 Novembre 2025",
      location: "Auditorium",
      image: "/placeholder.svg",
      category: "Activité culturelle",
      link: "/cultural-activities/event/5",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Exposition":
        return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/50";
      case "Conférence":
        return "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/50";
      case "Atelier":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50";
      case "Projection":
        return "bg-pink-500/20 text-pink-700 dark:text-pink-300 border-pink-500/50";
      case "Activité culturelle":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/50";
    }
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5000,
        }),
      ]}
      setApi={setApi}
      className="w-full max-w-6xl mx-auto"
    >
      <CarouselContent>
        {upcomingEvents.map((event) => (
          <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="overflow-hidden h-full rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge className={`${getCategoryColor(event.category)} border`}>
                      {event.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent-foreground" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent-foreground" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full rounded-2xl transition-all duration-300" 
                    variant="outline"
                    asChild
                  >
                    <a href={event.link}>
                      Découvrir
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="rounded-2xl" />
      <CarouselNext className="rounded-2xl" />
    </Carousel>
  );
}
