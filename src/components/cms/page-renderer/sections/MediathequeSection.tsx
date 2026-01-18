import { useState } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SectionProps {
  section: any;
  language: 'fr' | 'ar';
}

interface VideoItem {
  id: string;
  title: string;
  titleAr?: string;
  youtubeId: string;
  thumbnail?: string;
}

const defaultVideos: VideoItem[] = [
  {
    id: "1",
    title: "Visite virtuelle de la BNRM",
    titleAr: "جولة افتراضية في المكتبة الوطنية",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Conservation des manuscrits",
    titleAr: "صيانة المخطوطات",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "3",
    title: "Numérisation du patrimoine",
    titleAr: "رقمنة التراث",
    youtubeId: "dQw4w9WgXcQ",
  }
];

export function MediathequeSection({ section, language }: SectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const videos: VideoItem[] = section.props?.videos || defaultVideos;
  const title = language === 'ar' ? (section.title_ar || 'الميدياتيك') : (section.title_fr || 'Médiathèque');
  
  const visibleVideos = videos.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < videos.length;
  const canGoPrev = currentIndex > 0;

  return (
    <section className="py-16 bg-slate-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="bg-gold-bn-primary/20 text-gold-bn-primary border-gold-bn-primary/30 mb-4">
            Média
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-white">
            <span className="border-b-2 border-gold-bn-primary pb-2">{title}</span>
          </h2>
        </div>

        {/* Video Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={!canGoPrev}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleVideos.map((video) => (
                <Card key={video.id} className="bg-white overflow-hidden group cursor-pointer">
                  <div className="relative aspect-video bg-slate-200">
                    <img 
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt={language === 'ar' && video.titleAr ? video.titleAr : video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-gold-bn-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-heading font-semibold text-slate-dark line-clamp-2">
                      {language === 'ar' && video.titleAr ? video.titleAr : video.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(Math.min(videos.length - 3, currentIndex + 1))}
              disabled={!canGoNext}
              className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}