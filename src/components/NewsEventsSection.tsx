import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import eventRoiImage from "@/assets/event-roi-mohammed-6.png";
import eventTurquieImage from "@/assets/event-turquie-bnrm.png";

interface NewsEventsSectionProps {
  language: string;
}

export function NewsEventsSection({ language }: NewsEventsSectionProps) {
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const news = [
    {
      id: 1,
      tag: {
        fr: "Actualité Royale",
        ar: "أخبار ملكية",
        en: "Royal News",
        es: "Noticias Reales",
        amz: "ⵉⵙⴰⵍⵏ ⵉⴳⵍⴷⴰⵏ",
      },
      title: {
        fr: "Le Roi annonce la clôture définitive du dossier du Sahara",
        ar: "الملك يعلن الإغلاق النهائي لملف الصحراء",
        en: "The King announces the definitive closure of the Sahara dossier",
        es: "El Rey anuncia el cierre definitivo del expediente del Sahara",
        amz: "ⴰⴳⵍⵍⵉⴷ ⵉⵙⵙⵍⴽⵏ ⴰⵇⴼⵍ ⴰⵎⴳⴳⴰⵔⵓ ⵏ ⵓⵙⴷⴰⵡ ⵏ ⵜⵏⵥⵕⵓⴼⵜ",
      },
      excerpt: {
        fr: "Sa Majesté le Roi Mohammed VI a présidé une cérémonie historique marquant une nouvelle ère pour le Royaume.",
        ar: "ترأس جلالة الملك محمد السادس حفلا تاريخيا يعلن عهدا جديدا للمملكة.",
        en: "His Majesty King Mohammed VI presided over a historic ceremony marking a new era for the Kingdom.",
        es: "Su Majestad el Rey Mohammed VI presidió una ceremonia histórica que marca una nueva era para el Reino.",
        amz: "ⵉⵙⵙⵉⵅⴼ ⴱⴰⴱ ⵏ ⵡⴰⴷⴷⵓⵔ ⴰⴳⵍⵍⵉⴷ ⵎⵓⵃⵎⵎⴷ ⵡⵉⵙⵙ ⵚⴹⵉⵚ ⵢⴰⵏ ⵓⵏⵎⵓⴳⴳⴰⵔ ⴰⵎⵣⵔⴰⵢⴰⵏ.",
      },
      image: eventRoiImage,
    },
    {
      id: 2,
      tag: {
        fr: "Coopération Internationale",
        ar: "تعاون دولي",
        en: "International Cooperation",
        es: "Cooperación Internacional",
        amz: "ⴰⵎⵢⴰⵡⴰⵙ ⴰⵎⴰⴹⵍⴰⵏ",
      },
      title: {
        fr: "La Directrice de la BNRM en visite à la Bibliothèque Nationale de Turquie",
        ar: "مديرة المكتبة الوطنية في زيارة إلى مكتبة تركيا الوطنية",
        en: "The Director of BNRM visits the National Library of Turkey",
        es: "La Directora de la BNRM visita la Biblioteca Nacional de Turquía",
        amz: "ⵜⴰⵏⵎⵀⴰⵍⵜ ⵏ ⵜⵎⴰⵙⴷⴰⵡⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ ⵜⵔⵣⵓ ⵜⴰⵎⴰⵙⴷⴰⵡⵉⵜ ⵜⴰⵏⴰⵎⵓⵔⵜ ⵏ ⵜⵜⵓⵔⴽ",
      },
      excerpt: {
        fr: "Madame Samira El Malizi renforce les liens culturels lors d'une visite officielle en Turquie.",
        ar: "السيدة سميرة المليزي تعزز الروابط الثقافية خلال زيارة رسمية إلى تركيا.",
        en: "Mrs. Samira El Malizi strengthens cultural ties during an official visit to Turkey.",
        es: "La Sra. Samira El Malizi refuerza los vínculos culturales durante una visita oficial a Turquía.",
        amz: "ⵎⴰⵙⵙⴰ ⵙⴰⵎⵉⵔⴰ ⵍⵎⵍⵉⵣⵉ ⵜⵙⵙⵖⵥⵏ ⵉⵣⴷⴰⵢⵏ ⵉⴷⵍⵙⴰⵏⵏ ⵙ ⵜⵔⵣⵉ ⵜⴰⵎⴰⴷⴷⵓⴷⵜ ⵖⵔ ⵜⵜⵓⵔⴽ.",
      },
      image: eventTurquieImage,
    },
  ];

  // Get text for current language with fallback
  const getText = (textObj: Record<string, string>) => {
    return textObj[language] || textObj.fr;
  };

  return (
    <section className="pt-8 pb-8 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Header with blue background */}
        <div className="bg-[#1e3a8a] text-white px-8 py-8 rounded-lg mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="bnrm-caption uppercase tracking-widest mb-2" style={{ color: '#93C5FD' }}>
                BNRM
              </p>
              <h2 className="bnrm-section-title text-white mb-4">
                {t('portal.newsEvents.title')}
              </h2>
              <div className="w-24 h-1 bg-blue-soft mb-4"></div>
              <p className="bnrm-body-text text-white/90 max-w-2xl">
                {t('portal.newsEvents.subtitle')}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/news')}
              className="bg-blue-primary-dark text-white border-blue-primary-dark hover:bg-blue-deep"
            >
              {t('portal.newsEvents.viewAll')}
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
                  alt={getText(item.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <Badge variant="outline" className="bnrm-tag mb-3">
                  {getText(item.tag)}
                </Badge>
                <h3 className="bnrm-card-title text-[#1e3a8a] mb-2 group-hover:text-blue-600 transition-colors">
                  {getText(item.title)}
                </h3>
                <p className="bnrm-body-text-sm mb-3">
                  {getText(item.excerpt)}
                </p>
                <Button variant="ghost" size="sm" className={`p-0 h-auto font-semibold group-hover:translate-x-1 transition-transform ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {t('portal.newsEvents.moreInfo')} <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
