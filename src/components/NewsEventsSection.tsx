import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Language } from "@/hooks/useLanguage";

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
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white mb-3">
              BNRM
            </Badge>
            <h2 className="text-4xl font-bold text-[#1e3a8a] mb-3 relative inline-block">
              Actualités & Événements
              <div className="absolute bottom-0 left-0 w-32 h-1 bg-orange-500"></div>
            </h2>
            <p className="text-muted-foreground mt-4">
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
              className="aspect-[3/4] bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/news/1')}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <Badge className="bg-amber-500/90 backdrop-blur-sm text-white">
                    Événement Royal
                  </Badge>
                </div>
              </div>
            </div>

            {/* Image 2 - Visite Turquie */}
            <div 
              className="aspect-[3/4] bg-gradient-to-br from-red-700 via-red-600 to-red-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/news/2')}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
                <div className="absolute inset-0 flex items-end p-4">
                  <Badge className="bg-blue-500/90 backdrop-blur-sm text-white">
                    Coopération
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

