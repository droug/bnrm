import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";

interface BNRMService {
  id_service: string;
  categorie: string;
  nom_service: string;
  description: string | null;
  public_cible: string | null;
  reference_legale: string | null;
}

interface BNRMTariff {
  id_tarif: string;
  id_service: string;
  montant: number;
  devise: string;
  condition_tarif: string | null;
  periode_validite: string;
  is_active: boolean | null;
}

interface DigitalServicesCarouselProps {
  language: 'fr' | 'ar';
}

export function DigitalServicesCarousel({ language }: DigitalServicesCarouselProps) {
  const navigate = useNavigate();
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      const { data: servicesData, error: servicesError } = await supabase
        .from("bnrm_services")
        .select("*")
        .order("nom_service");

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      const { data: tariffsData, error: tariffsError } = await supabase
        .from("bnrm_tarifs")
        .select("*")
        .eq("is_active", true)
        .order("montant");

      if (tariffsError) throw tariffsError;
      setTariffs(tariffsData || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTariffsForService = (serviceId: string) => {
    return tariffs.filter(t => t.id_service === serviceId);
  };

  const getServiceImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80",
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80",
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
    ];
    return images[index % images.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const allServices = [
    {
      id: 'depot-legal',
      title: language === 'ar' ? 'الإيداع القانوني' : 'Dépôt Légal',
      description: language === 'ar' 
        ? 'قم بإيداع مطبوعاتك ووثائقك وفقاً للقانون. خدمة إلزامية للناشرين والمؤلفين.'
        : 'Déposez vos publications et documents selon la loi. Service obligatoire pour les éditeurs et auteurs.',
      category: language === 'ar' ? 'خدمة أساسية' : 'Service Essentiel',
      onClick: () => navigate('/depot-legal')
    },
    {
      id: 'abonnements',
      title: language === 'ar' ? 'الاشتراكات في المكتبة الوطنية' : 'Abonnements à la BNRM',
      description: language === 'ar'
        ? 'سجل للوصول إلى موارد وخدمات المكتبة.'
        : 'Inscrivez-vous pour accéder aux ressources et services de la bibliothèque.',
      category: language === 'ar' ? 'اشتراك' : 'Abonnement',
      onClick: () => navigate('/abonnements?platform=portal')
    },
    {
      id: 'espaces-culturels',
      title: language === 'ar' ? 'حجز الفضاءات الثقافية' : 'Réservation des espaces culturels',
      description: language === 'ar'
        ? 'احجز فضاءاتنا لفعالياتك الثقافية والأكاديمية.'
        : 'Réservez nos espaces pour vos événements culturels et académiques.',
      category: language === 'ar' ? 'حجز' : 'Réservation',
      onClick: () => navigate('/reservation-espaces')
    },
    {
      id: 'pass-journalier',
      title: language === 'ar' ? 'بطاقة يومية' : 'Pass journalier',
      description: language === 'ar'
        ? 'دخول مجاني إلى المكتبة ليوم واحد.'
        : services.find(s => s.nom_service === 'Pass journalier')?.description || 'Accès gratuit à la bibliothèque pour une journée.',
      category: language === 'ar' ? 'وصول' : 'Accès',
      onClick: () => navigate('/pass-journalier')
    },
    {
      id: 'reproduction',
      title: language === 'ar' ? 'نسخ الوثائق' : 'Reproduction de documents',
      description: language === 'ar'
        ? 'خدمة نسخ ورقمنة الوثائق من المجموعة.'
        : 'Service de reproduction et numérisation de documents de la collection.',
      category: language === 'ar' ? 'خدمة حسب الطلب' : 'Service à la demande',
      onClick: () => navigate('/reproduction')
    },
    {
      id: 'restauration',
      title: language === 'ar' ? 'طلب الترميم' : 'Demande de restauration',
      description: language === 'ar'
        ? 'خدمة ترميم وحفظ الوثائق القديمة.'
        : services.find(s => s.nom_service === 'Restauration')?.description || 'Service de restauration et conservation de documents anciens.',
      category: language === 'ar' ? 'ترميم' : 'Restauration',
      onClick: () => navigate('/demande-restauration')
    },
    {
      id: 'reservation-document',
      title: language === 'ar' ? 'حجز وثيقة' : 'Réserver un document',
      description: language === 'ar'
        ? 'احجز الوثائق للاطلاع عليها في المكان.'
        : 'Réservez des documents pour consultation sur place.',
      category: language === 'ar' ? 'خدمة حسب الطلب' : 'Service à la demande',
      onClick: () => navigate('/cbn/reserver-ouvrage')
    },
    {
      id: 'location',
      title: language === 'ar' ? 'الإيجار حسب الطلب' : 'Location à la demande',
      description: language === 'ar'
        ? 'خدمة إيجار الوثائق والموارد.'
        : 'Service de location de documents et ressources.',
      category: language === 'ar' ? 'خدمة حسب الطلب' : 'Service à la demande',
      onClick: () => navigate('/location-service')
    },
    {
      id: 'numerisation',
      title: language === 'ar' ? 'طلب الرقمنة' : 'Demande de numérisation',
      description: language === 'ar'
        ? 'خدمة احترافية لرقمنة الوثائق.'
        : services.find(s => s.nom_service === 'Numérisation documents rares')?.description || 'Service professionnel de numérisation de documents.',
      category: language === 'ar' ? 'خدمة حسب الطلب' : 'Service à la demande',
      onClick: () => navigate('/demande-numerisation')
    },
    {
      id: 'ewallet',
      title: language === 'ar' ? 'المحفظة الإلكترونية' : 'e-Wallet BNRM',
      description: language === 'ar'
        ? 'محفظة إلكترونية لإدارة مدفوعاتك ومعاملاتك.'
        : 'Portefeuille électronique pour gérer vos paiements et transactions.',
      category: language === 'ar' ? 'خدمة رقمية' : 'Service numérique',
      onClick: () => navigate('/wallet')
    }
  ];

  return (
    <div className="relative" dir="ltr">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent>
          {allServices.map((service, index) => (
            <CarouselItem key={service.id} className="md:basis-1/2 lg:basis-1/3 flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
              <div
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col"
                onClick={service.onClick}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getServiceImage(index)}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Category */}
                  <div className="mb-4">
                    <span className="bnrm-tag inline-flex items-center">
                      {service.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="bnrm-card-title mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="bnrm-body-text-sm line-clamp-3 flex-1">
                    {service.description}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-8">
        {/* Pagination Dots */}
        <div className="flex gap-2">
          {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => api?.scrollPrev()}
            className="p-3 rounded-lg transition-colors bnrm-btn-primary"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            className="p-3 rounded-lg transition-colors bnrm-btn-primary"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* View All Services Button */}
      <div className="text-center mt-8">
        <Button
          onClick={() => navigate('/services-bnrm')}
          size="lg"
          className="bnrm-btn-primary px-8 py-6 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
        >
          {language === 'ar' ? 'عرض جميع الخدمات' : 'Voir tous nos services'}
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
