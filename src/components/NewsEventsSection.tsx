import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Language } from "@/hooks/useLanguage";

interface NewsEventsSectionProps {
  language: Language;
}

export function NewsEventsSection({ language }: NewsEventsSectionProps) {
  const navigate = useNavigate();

  const featuredEvent = {
    id: 1,
    title_fr: "Sa Majesté le Roi Mohammed VI inaugure la nouvelle aile de la BNRM",
    title_ar: "جلالة الملك محمد السادس يدشن الجناح الجديد للمكتبة الوطنية",
    date: "2025-01-20",
    location_fr: "Rabat, Maroc",
    location_ar: "الرباط، المغرب",
    category_fr: "Événement Royal",
    category_ar: "حدث ملكي",
    excerpt_fr: "Sa Majesté le Roi Mohammed VI a présidé la cérémonie d'inauguration de la nouvelle aile de la Bibliothèque Nationale, marquant une étape majeure dans la préservation du patrimoine culturel marocain.",
    excerpt_ar: "ترأس جلالة الملك محمد السادس حفل افتتاح الجناح الجديد للمكتبة الوطنية، مما يشكل خطوة رئيسية في الحفاظ على التراث الثقافي المغربي.",
    image: "royal",
  };

  const otherEvents = [
    {
      id: 2,
      title_fr: "La Directrice de la BNRM en visite à la Bibliothèque Nationale de Turquie",
      title_ar: "مديرة المكتبة الوطنية في زيارة إلى مكتبة تركيا الوطنية",
      date: "2025-01-15",
      location_fr: "Ankara, Turquie",
      location_ar: "أنقرة، تركيا",
      category_fr: "Coopération Internationale",
      category_ar: "تعاون دولي",
      excerpt_fr: "Madame Samira El Malizi, Directrice de la Bibliothèque Nationale du Royaume du Maroc, effectue une visite officielle à la Bibliothèque Nationale de Turquie pour renforcer la coopération bilatérale.",
      excerpt_ar: "تقوم السيدة سميرة المليزي، مديرة المكتبة الوطنية للمملكة المغربية، بزيارة رسمية إلى مكتبة تركيا الوطنية لتعزيز التعاون الثنائي.",
    },
    {
      id: 3,
      title_fr: "Exposition : Manuscrits Andalous du XIIe siècle",
      title_ar: "معرض: المخطوطات الأندلسية من القرن الثاني عشر",
      date: "2025-01-25",
      location_fr: "BNRM, Rabat",
      location_ar: "المكتبة الوطنية، الرباط",
      category_fr: "Exposition",
      category_ar: "معرض",
      excerpt_fr: "Découvrez une collection exceptionnelle de manuscrits andalous datant du XIIe siècle, témoins de l'âge d'or de la civilisation arabo-musulmane.",
      excerpt_ar: "اكتشف مجموعة استثنائية من المخطوطات الأندلسية التي يعود تاريخها إلى القرن الثاني عشر، شاهدة على العصر الذهبي للحضارة العربية الإسلامية.",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'الأخبار والفعاليات' : 'Actualités & Événements'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'آخر الأخبار والفعاليات من المكتبة الوطنية'
              : 'Dernières actualités et événements de la Bibliothèque Nationale'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured Event */}
          <Card 
            className="lg:col-span-2 group hover:shadow-xl transition-all cursor-pointer overflow-hidden"
            onClick={() => navigate(`/news/${featuredEvent.id}`)}
          >
            <div className="aspect-video bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              <div className="relative z-10 text-center p-8">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <Badge className="bg-amber-500 text-white hover:bg-amber-600 mb-2">
                  {language === 'ar' ? featuredEvent.category_ar : featuredEvent.category_fr}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(featuredEvent.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4" />
                <span>{language === 'ar' ? featuredEvent.location_ar : featuredEvent.location_fr}</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {language === 'ar' ? featuredEvent.title_ar : featuredEvent.title_fr}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {language === 'ar' ? featuredEvent.excerpt_ar : featuredEvent.excerpt_fr}
              </p>
              <Button variant="ghost" className="group-hover:translate-x-2 transition-transform">
                {language === 'ar' ? 'اقرأ المزيد' : 'Lire la suite'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Other Events */}
          <div className="space-y-6">
            {otherEvents.map((event) => (
              <Card
                key={event.id}
                className="group hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/news/${event.id}`)}
              >
                <CardContent className="p-5">
                  <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                    {language === 'ar' ? event.category_ar : event.category_fr}
                  </Badge>
                  <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {language === 'ar' ? event.title_ar : event.title_fr}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {language === 'ar' ? event.excerpt_ar : event.excerpt_fr}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/news')}
            className="group"
          >
            {language === 'ar' ? 'عرض جميع الأخبار والفعاليات' : 'Voir toutes les actualités et événements'}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}

