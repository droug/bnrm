import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Language } from "@/hooks/useLanguage";
import eventRoiImage from "@/assets/event-roi-mohammed-6.png";
import eventTurquieImage from "@/assets/event-turquie-bnrm.png";

interface NewsEventsSectionProps {
  language: Language;
}

export function NewsEventsSection({ language }: NewsEventsSectionProps) {
  const navigate = useNavigate();

  const news = [
    {
      id: 1,
      tag_fr: "Actualité Royale",
      tag_ar: "أخبار ملكية",
      title_fr: "Le Roi annonce la clôture définitive du dossier du Sahara",
      title_ar: "الملك يعلن الإغلاق النهائي لملف الصحراء",
      excerpt_fr: "Sa Majesté le Roi Mohammed VI a présidé une cérémonie historique marquant une nouvelle ère pour le Royaume.",
      excerpt_ar: "ترأس جلالة الملك محمد السادس حفلا تاريخيا يعلن عهدا جديدا للمملكة.",
    },
    {
      id: 2,
      tag_fr: "Coopération Internationale",
      tag_ar: "تعاون دولي",
      title_fr: "La Directrice de la BNRM en visite à la Bibliothèque Nationale de Turquie",
      title_ar: "مديرة المكتبة الوطنية في زيارة إلى مكتبة تركيا الوطنية",
      excerpt_fr: "Madame Samira El Malizi renforce les liens culturels lors d'une visite officielle en Turquie.",
      excerpt_ar: "السيدة سميرة المليزي تعزز الروابط الثقافية خلال زيارة رسمية إلى تركيا.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wide mb-2">
              BNRM
            </p>
            <h2 className="text-4xl font-bold text-[#1e3a8a] mb-4">
              Actualités & Événements
            </h2>
            <div className="w-24 h-1 bg-orange-500 mb-4"></div>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/news')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            View all
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Text Articles */}
          <div className="space-y-6">
            {news.map((item) => (
              <div 
                key={item.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/news/${item.id}`)}
              >
                <Badge variant="outline" className="mb-2 text-xs">
                  {language === 'ar' ? item.tag_ar : item.tag_fr}
                </Badge>
                <h3 className="text-xl font-bold text-[#1e3a8a] mb-2 group-hover:text-blue-600 transition-colors">
                  {language === 'ar' ? item.title_ar : item.title_fr}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {language === 'ar' ? item.excerpt_ar : item.excerpt_fr}
                </p>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform">
                  Button <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Right Column - Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image 1 - Roi Mohammed VI */}
            <div 
              className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group"
              onClick={() => navigate('/news/1')}
            >
              <img 
                src={eventRoiImage} 
                alt="Sa Majesté le Roi Mohammed VI"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <Badge className="bg-amber-500/90 backdrop-blur-sm text-white">
                  Événement Royal
                </Badge>
              </div>
            </div>

            {/* Image 2 - Visite Turquie */}
            <div 
              className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform relative group"
              onClick={() => navigate('/news/2')}
            >
              <img 
                src={eventTurquieImage} 
                alt="Visite à la Bibliothèque Nationale de Turquie"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-end p-4">
                <Badge className="bg-blue-500/90 backdrop-blur-sm text-white">
                  Coopération
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

