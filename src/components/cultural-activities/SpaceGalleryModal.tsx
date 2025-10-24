import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

// Import images
import auditorium1 from "@/assets/spaces/auditorium-1.jpg";
import auditorium2 from "@/assets/spaces/auditorium-2.jpg";
import exhibitionHall1 from "@/assets/spaces/exhibition-hall-1.jpg";
import exhibitionHall2 from "@/assets/spaces/exhibition-hall-2.jpg";
import seminarRoom1 from "@/assets/spaces/seminar-room-1.jpg";
import meetingRoom1 from "@/assets/spaces/meeting-room-1.jpg";
import annexHall1 from "@/assets/spaces/annex-hall-1.jpg";

interface SpaceGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
}

const spaceImages: Record<string, { src: string; alt: string }[]> = {
  "Auditorium": [
    { src: auditorium1, alt: "Auditorium - Vue d'ensemble depuis les sièges" },
    { src: auditorium2, alt: "Auditorium - Vue de la scène" },
  ],
  "Grande salle d'exposition": [
    { src: exhibitionHall1, alt: "Grande salle d'exposition - Espace vide" },
    { src: exhibitionHall2, alt: "Grande salle d'exposition - Configuration d'exposition" },
  ],
  "Salle séminaire": [
    { src: seminarRoom1, alt: "Salle séminaire - Disposition en U" },
  ],
  "Salle de réunion": [
    { src: meetingRoom1, alt: "Salle de réunion - Table de conférence" },
  ],
  "Salle de l'annexe": [
    { src: annexHall1, alt: "Salle de l'annexe - Espace modulable" },
  ],
};

export default function SpaceGalleryModal({ isOpen, onClose, spaceName }: SpaceGalleryModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const images = spaceImages[spaceName] || [];

  const scrollPrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  };

  const scrollNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setSelectedIndex(emblaApi.selectedScrollSnap());
    }
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{spaceName} - Galerie photos</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-[500px] object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={scrollNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              <div className="flex justify-center gap-2 mt-4">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === selectedIndex
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30"
                    }`}
                    onClick={() => {
                      emblaApi?.scrollTo(index);
                      setSelectedIndex(index);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {images[selectedIndex]?.alt}
        </p>
      </DialogContent>
    </Dialog>
  );
}
