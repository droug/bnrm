import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeThumbnail } from "@/components/media/YoutubeThumbnail";

interface MediathequeSectionProps {
  language: string;
}

interface MediathequeVideo {
  id: string;
  youtube_id: string;
  title_fr: string;
  title_ar: string | null;
}

// Fallback videos if database is empty
const defaultVideos = [
  { id: "1", youtube_id: "2hOKleHBUYs", title_fr: "Visite guidée de la BNRM", title_ar: "جولة إرشادية في المكتبة الوطنية" },
  { id: "2", youtube_id: "l02BjttZjmE", title_fr: "Collections patrimoniales", title_ar: "المجموعات التراثية" },
  { id: "3", youtube_id: "LDGq_sRVSog", title_fr: "Manuscrits anciens", title_ar: "المخطوطات القديمة" },
  { id: "4", youtube_id: "5vA8lzi8tCU", title_fr: "Activités culturelles", title_ar: "الأنشطة الثقافية" },
  { id: "5", youtube_id: "GjCFxTlnYac", title_fr: "Services numériques", title_ar: "الخدمات الرقمية" },
  { id: "6", youtube_id: "ILx_Ooc9TqA", title_fr: "Patrimoine marocain", title_ar: "التراث المغربي" }
];

const extractYoutubeId = (input: string) => {
  const raw = input.trim();

  // Already an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  // Try parsing as URL
  try {
    const url = new URL(raw);

    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

    // /embed/<id> or /shorts/<id>
    const parts = url.pathname.split("/").filter(Boolean);
    const markerIndex = parts.findIndex((p) => p === "embed" || p === "shorts");
    if (markerIndex >= 0) {
      const id = parts[markerIndex + 1];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }
  } catch {
    // not a URL
  }

  // Last resort: find any 11-char token
  const match = raw.match(/([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? raw;
};

export const MediathequeSection = ({ language }: MediathequeSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Fetch videos from CMS
  const { data: cmsVideos = [], isLoading } = useQuery({
    queryKey: ['mediatheque-videos-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_mediatheque_videos')
        .select('id, youtube_id, title_fr, title_ar')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching mediatheque videos:', error);
        return [];
      }
      return data as MediathequeVideo[];
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Use CMS videos if available, otherwise fallback to defaults
  const videos = cmsVideos.length > 0 ? cmsVideos : defaultVideos;

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

  const handlePlayVideo = (youtubeId: string) => {
    setPlayingVideo(youtubeId);
  };

  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };

  const getTitle = (video: MediathequeVideo) => {
    return language === 'ar' ? (video.title_ar || video.title_fr) : video.title_fr;
  };


  return (
    <section className="py-0 mb-12">
      <div className="bg-blue-dark text-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          {/* Badge Média */}
          <p className="bnrm-caption uppercase tracking-widest text-blue-soft mb-2">
            BNRM
          </p>
          
          {/* Title */}
          <h2 className="bnrm-section-title text-white mb-4">
            {ml('Médiathèque', 'الوسائط المتعددة', 'Media Library', 'Mediateca', 'ⵜⴰⵎⵉⴷⵢⴰⵜⵉⴽⵜ')}
          </h2>
          
          {/* Underline */}
          <div className="w-24 h-1 bg-gold-primary mb-4"></div>
          
          {/* Description */}
          <p className="bnrm-body-text text-white/80 max-w-2xl">
            {ml(
              'Explorez nos riches collections audiovisuelles et multimédias',
              'استكشف مجموعاتنا الصوتية والمرئية الغنية',
              'Explore our rich audiovisual and multimedia collections',
              'Explore nuestras ricas colecciones audiovisuales y multimedia',
              'ⵙⵙⵓⴷⵓ ⵜⵉⴳⵔⴰⵡⵉⵏ ⵏⵏⵖ ⵏ ⵉⵎⵙⵍⵉ ⴷ ⵜⵉⵡⵍⴰⴼⵉⵏ'
            )}
          </p>
        </div>

        {/* Video Carousel - White background area */}
        <div className="bg-white mx-0 rounded-none">
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleVideos.map((video) => {
                  const youtubeId = extractYoutubeId(video.youtube_id);
                  const title = getTitle(video);

                  return (
                    <div 
                      key={video.id} 
                      className="relative group cursor-pointer rounded-lg overflow-hidden aspect-[4/3] bg-slate-100"
                      onClick={() => handlePlayVideo(youtubeId)}
                    >
                      {playingVideo === youtubeId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={title}
                        />
                      ) : (
                        <>
                          {/* Thumbnail */}
                          <YoutubeThumbnail
                            youtubeId={youtubeId}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer with pagination and navigation - back to blue */}
        {videos.length > itemsPerPage && (
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
        )}
      </div>
    </section>
  );
};
