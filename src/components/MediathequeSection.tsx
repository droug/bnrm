import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MediathequeSectionProps {
  language: string;
}

export const MediathequeSection = ({ language }: MediathequeSectionProps) => {
  const navigate = useNavigate();

  const videos = [
    {
      id: "2hOKleHBUYs",
      title: { fr: "Vidéo 1", ar: "فيديو 1" }
    },
    {
      id: "l02BjttZjmE",
      title: { fr: "Vidéo 2", ar: "فيديو 2" }
    },
    {
      id: "LDGq_sRVSog",
      title: { fr: "Vidéo 3", ar: "فيديو 3" }
    },
    {
      id: "5vA8lzi8tCU",
      title: { fr: "Vidéo 4", ar: "فيديو 4" }
    },
    {
      id: "GjCFxTlnYac",
      title: { fr: "Vidéo 5", ar: "فيديو 5" }
    },
    {
      id: "ILx_Ooc9TqA",
      title: { fr: "Vidéo 6", ar: "فيديو 6" }
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className={`mb-12 ${language === 'ar' ? 'text-center' : 'text-left'}`}>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
            BNRM
          </p>
          <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
            {language === 'ar' ? 'الوسائط المتعددة' : 'Médiathèque'}
          </h2>
          <div className={`w-24 h-1 bg-orange-500 mb-6 ${language === 'ar' ? 'mx-auto' : ''}`}></div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {language === 'ar' 
              ? 'استكشف مجموعاتنا الصوتية والمرئية الغنية'
              : 'Explorez nos riches collections audiovisuelles et multimédias'
            }
          </p>
        </div>

        {/* Video Carousel */}
        <div className="mb-8 px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {videos.map((video, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/2">
                  <Card className="border-2 hover:border-orange-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="aspect-video rounded-lg overflow-hidden mb-4">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={video.title[language]}
                        />
                      </div>
                      <h3 className="text-base font-semibold text-center text-foreground">
                        {video.title[language]}
                      </h3>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/digital-library')}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-blue-900 hover:from-orange-600 hover:to-blue-950 text-white px-8 py-6 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Library className={`h-5 w-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {language === 'ar' ? 'استكشف الوسائط المتعددة' : 'Explorer la médiathèque'}
          </Button>
        </div>
      </div>
    </section>
  );
};
