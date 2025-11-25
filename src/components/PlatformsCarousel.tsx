import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import zelligePattern1 from "@/assets/zellige-pattern-1.jpg";
import zelligePattern2 from "@/assets/zellige-pattern-2.jpg";
import zelligePattern3 from "@/assets/zellige-pattern-3.jpg";
import zelligePattern5 from "@/assets/zellige-pattern-5.jpg";
import zelligePattern6 from "@/assets/zellige-pattern-6.jpg";

interface Platform {
  id: number;
  title: string;
  titleAr: string;
  path: string;
  image: string;
  description?: string;
}

interface PlatformsCarouselProps {
  language: string;
}

const platforms: Platform[] = [
  {
    id: 1,
    title: "Bibliothèque Numérique",
    titleAr: "المكتبة الرقمية",
    path: "/digital-library",
    image: zelligePattern5,
    description: "Accédez à notre collection numérique de documents patrimoniaux"
  },
  {
    id: 2,
    title: "Manuscrits",
    titleAr: "مخطوطات",
    path: "/plateforme-manuscrits",
    image: zelligePattern1
  },
  {
    id: 3,
    title: "Catalogue CBM",
    titleAr: "CBM",
    path: "/cbm",
    image: zelligePattern2
  },
  {
    id: 4,
    title: "Kitab",
    titleAr: "Kitab",
    path: "/kitab",
    image: zelligePattern6
  },
  {
    id: 5,
    title: "Activités Culturelles",
    titleAr: "الأنشطة الثقافية",
    path: "/cultural-activities",
    image: zelligePattern3
  }
];

export const PlatformsCarousel = ({ language }: PlatformsCarouselProps) => {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const featuredPlatform = platforms[selectedIndex];
  const otherPlatforms = platforms.filter((_, idx) => idx !== selectedIndex).slice(0, 3);

  return (
    <div className="relative py-20 my-12 overflow-hidden bg-[rgb(32,45,94)] rounded-lg">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-orange-500 rounded mb-4">
            {language === 'ar' ? 'خدمة' : 'SERVICE'}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {language === 'ar' ? 'منصاتنا الرئيسية' : 'Nos Services Principaux'}
          </h2>
          <p className="text-white/80 text-sm max-w-md">
            {language === 'ar' 
              ? 'اكتشف خدماتنا الرقمية والثقافية المتنوعة'
              : 'Découvrez nos services numériques et culturels variés'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured Platform */}
          <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl group cursor-pointer"
               onClick={() => navigate(featuredPlatform.path)}>
            <div className="absolute top-0 left-0 z-10">
              <div className="relative">
                <div className="bg-blue-500 text-white font-bold text-2xl px-6 py-3 pr-12">
                  0{featuredPlatform.id}
                </div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-transparent border-l-[40px] border-l-blue-500" 
                     style={{ transform: 'translateX(100%)' }}></div>
              </div>
            </div>
            
            <div className="p-8 pt-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {language === 'ar' ? featuredPlatform.titleAr : featuredPlatform.title}
              </h3>
              {featuredPlatform.description && (
                <p className="text-gray-600 text-sm mb-6">
                  {featuredPlatform.description}
                </p>
              )}
              
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img 
                  src={featuredPlatform.image}
                  alt={featuredPlatform.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-orange-500"></div>
          </div>

          {/* Other Platforms Grid */}
          <div className="grid grid-cols-1 gap-4">
            {otherPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="relative h-32 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
                onClick={() => navigate(platform.path)}
              >
                <img 
                  src={platform.image}
                  alt={platform.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/60"></div>
                
                <div className="relative h-full flex items-center justify-between px-6">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      {language === 'ar' ? platform.titleAr : platform.title}
                    </h3>
                  </div>
                  
                  <div className="bg-blue-500 text-white font-bold text-sm px-3 py-1.5 rounded">
                    0{platform.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {platforms.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === selectedIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

