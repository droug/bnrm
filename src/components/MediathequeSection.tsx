import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface MediathequeSectionProps {
  language: string;
}

export const MediathequeSection = ({ language }: MediathequeSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Vidéos YouTube réelles de la BNRM
  const videos = [
    {
      id: "2hOKleHBUYs",
      title: { fr: "Visite guidée de la BNRM", ar: "جولة إرشادية في المكتبة الوطنية" },
      thumbnail: `https://img.youtube.com/vi/2hOKleHBUYs/maxresdefault.jpg`
    },
    {
      id: "l02BjttZjmE",
      title: { fr: "Collections patrimoniales", ar: "المجموعات التراثية" },
      thumbnail: `https://img.youtube.com/vi/l02BjttZjmE/maxresdefault.jpg`
    },
    {
      id: "LDGq_sRVSog",
      title: { fr: "Manuscrits anciens", ar: "المخطوطات القديمة" },
      thumbnail: `https://img.youtube.com/vi/LDGq_sRVSog/maxresdefault.jpg`
    },
    {
      id: "5vA8lzi8tCU",
      title: { fr: "Activités culturelles", ar: "الأنشطة الثقافية" },
      thumbnail: `https://img.youtube.com/vi/5vA8lzi8tCU/maxresdefault.jpg`
    },
    {
      id: "GjCFxTlnYac",
      title: { fr: "Services numériques", ar: "الخدمات الرقمية" },
      thumbnail: `https://img.youtube.com/vi/GjCFxTlnYac/maxresdefault.jpg`
    },
    {
      id: "ILx_Ooc9TqA",
      title: { fr: "Patrimoine marocain", ar: "التراث المغربي" },
      thumbnail: `https://img.youtube.com/vi/ILx_Ooc9TqA/maxresdefault.jpg`
    }
  ];

  const itemsPerPage = 4;
  const totalSlides = Math.ceil(videos.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const visibleVideos = videos.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage
  );

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideo(videoId);
  };

  return (
    <section className="py-0 mb-12">
      <div className="bg-blue-dark text-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          {/* Badge Média */}
          <p className="tagline text-blue-soft mb-2">
            BNRM
          </p>
          
          {/* Title */}
          <h2 className="heading-3 text-white mb-4">
            {language === 'ar' ? 'الوسائط المتعددة' : 'Médiathèque'}
          </h2>
          
          {/* Underline */}
          <div className="w-24 h-1 bg-gold-primary mb-4"></div>
          
          {/* Description */}
          <p className="text-regular text-white/80 max-w-2xl">
            {language === 'ar' 
              ? 'استكشف مجموعاتنا الصوتية والمرئية الغنية'
              : 'Explorez nos riches collections audiovisuelles et multimédias'
            }
          </p>
        </div>

        {/* Video Carousel - White background area */}
        <div className="bg-white mx-0 rounded-none">
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleVideos.map((video) => (
                <div 
                  key={video.id} 
                  className="relative group cursor-pointer rounded-lg overflow-hidden aspect-[4/3] bg-slate-100"
                  onClick={() => handlePlayVideo(video.id)}
                >
                  {playingVideo === video.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={video.title[language as 'fr' | 'ar']}
                    />
                  ) : (
                    <>
                      {/* Thumbnail */}
                      <img 
                        src={video.thumbnail}
                        alt={video.title[language as 'fr' | 'ar']}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                        }}
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-blue-primary/90 rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <Play className="h-6 w-6 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer with pagination and navigation - back to blue */}
        <div className="px-8 py-4 flex items-center justify-between">
          {/* Pagination dots */}
          <div className="flex gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="w-10 h-10 rounded-lg border-white/30 bg-transparent hover:bg-white/10 text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="w-10 h-10 rounded-lg border-white/30 bg-blue-primary hover:bg-blue-primary-dark text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
