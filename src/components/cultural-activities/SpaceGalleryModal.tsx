import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

interface GalleryImage {
  url: string;
  alt: string;
  order: number;
}

interface SpaceGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceName: string;
  galleryImages: GalleryImage[];
}

export default function SpaceGalleryModal({ isOpen, onClose, spaceName, galleryImages }: SpaceGalleryModalProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const images = galleryImages.length > 0 ? galleryImages : [
    { url: "/placeholder.svg", alt: spaceName + " - Aucune image disponible", order: 1 }
  ];

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

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
                    src={image.url}
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
