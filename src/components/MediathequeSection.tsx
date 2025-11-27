import { Button } from "@/components/ui/button";
import { Music, Video, Headphones, Film, Mic, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface MediathequeSectionProps {
  language: string;
}

export const MediathequeSection = ({ language }: MediathequeSectionProps) => {
  const navigate = useNavigate();

  const mediaTypes = [
    {
      icon: Music,
      title: { fr: "Musique", ar: "الموسيقى" },
      desc: { fr: "Collections audio et partitions", ar: "مجموعات صوتية ونوتات موسيقية" },
    },
    {
      icon: Video,
      title: { fr: "Vidéos", ar: "الفيديوهات" },
      desc: { fr: "Documentaires et archives audiovisuelles", ar: "أفلام وثائقية وأرشيف سمعي بصري" },
    },
    {
      icon: Headphones,
      title: { fr: "Podcasts", ar: "بودكاست" },
      desc: { fr: "Émissions et conférences enregistrées", ar: "برامج ومحاضرات مسجلة" },
    },
    {
      icon: Film,
      title: { fr: "Cinéma", ar: "السينما" },
      desc: { fr: "Films et archives cinématographiques", ar: "أفلام وأرشيف سينمائي" },
    },
    {
      icon: Mic,
      title: { fr: "Témoignages", ar: "شهادات" },
      desc: { fr: "Histoires orales et témoignages", ar: "تاريخ شفوي وشهادات" },
    },
    {
      icon: Library,
      title: { fr: "Archives", ar: "أرشيف" },
      desc: { fr: "Documents multimédias historiques", ar: "وثائق متعددة الوسائط تاريخية" },
    },
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

        {/* Grid of Media Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mediaTypes.map((media, index) => {
            const Icon = media.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-orange-500/50"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 bg-gradient-to-br from-orange-500/20 to-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-orange-500 group-hover:text-blue-900 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {media.title[language]}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {media.desc[language]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
