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
      image: eventRoiImage,
    },
    {
      id: 2,
      tag_fr: "Coopération Internationale",
      tag_ar: "تعاون دولي",
      title_fr: "La Directrice de la BNRM en visite à la Bibliothèque Nationale de Turquie",
      title_ar: "مديرة المكتبة الوطنية في زيارة إلى مكتبة تركيا الوطنية",
      excerpt_fr: "Madame Samira El Malizi renforce les liens culturels lors d'une visite officielle en Turquie.",
      excerpt_ar: "السيدة سميرة المليزي تعزز الروابط الثقافية خلال زيارة رسمية إلى تركيا.",
      image: eventTurquieImage,
    },
  ];

  return (
    <section className="pt-8 pb-8 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header with blue background */}
        <div className="bg-[#1e3a8a] text-white px-8 py-8 rounded-lg mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="bnrm-caption uppercase tracking-widest text-blue-soft mb-2">
                BNRM
              </p>
              <h2 className="bnrm-section-title text-white mb-4">
                {language === 'ar' ? 'الأخبار و الأحداث' : 'Actualités & Événements'}
              </h2>
              <div className="w-24 h-1 bg-blue-soft mb-4"></div>
              <p className="bnrm-body-text text-white/90 max-w-2xl">
                {language === 'ar' 
                  ? 'اطلع على آخر الأخبار والفعاليات'
                  : 'Découvrez les dernières actualités et événements'
                }
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/news')}
              className="bg-blue-primary-dark text-white border-blue-primary-dark hover:bg-blue-deep"
            >
              {language === 'ar' ? 'عرض الكل' : 'Tout afficher'}
            </Button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div 
              key={item.id}
              className="group cursor-pointer rounded-lg overflow-hidden bg-white shadow-md hover:shadow-xl transition-all"
              onClick={() => navigate(`/news/${item.id}`)}
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={language === 'ar' ? item.title_ar : item.title_fr}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <Badge variant="outline" className="bnrm-tag mb-3">
                  {language === 'ar' ? item.tag_ar : item.tag_fr}
                </Badge>
                <h3 className="bnrm-card-title text-[#1e3a8a] mb-2 group-hover:text-blue-600 transition-colors">
                  {language === 'ar' ? item.title_ar : item.title_fr}
                </h3>
                <p className="bnrm-body-text-sm mb-3">
                  {language === 'ar' ? item.excerpt_ar : item.excerpt_fr}
                </p>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform">
                  {language === 'ar' ? "المزيد من المعلومات" : "Plus d'infos"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

