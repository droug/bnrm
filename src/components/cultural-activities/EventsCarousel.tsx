import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

export default function EventsCarousel() {
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
    },
    {
      id: 2,
      title: "Conférence sur le patrimoine marocain",
      description: "Une exploration de la richesse culturelle du Maroc",
      date: "28 Octobre 2025",
      location: "Auditorium",
      image: "/placeholder.svg",
      category: "Conférence",
    },
    {
      id: 3,
      title: "Atelier de calligraphie arabe",
      description: "Initiez-vous à l'art ancestral de la calligraphie",
      date: "2 Novembre 2025",
      location: "Salle de formation",
      image: "/placeholder.svg",
      category: "Atelier",
    },
    {
      id: 4,
      title: "Projection de documentaire",
      description: "Histoire de la bibliothèque nationale du Royaume du Maroc",
      date: "5 Novembre 2025",
      location: "Auditorium",
      image: "/placeholder.svg",
      category: "Projection",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Exposition":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "Conférence":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "Atelier":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      case "Projection":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-6xl mx-auto"
    >
      <CarouselContent>
        {upcomingEvents.map((event) => (
          <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="overflow-hidden h-full">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
