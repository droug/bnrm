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
  language: string;
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

  const ml = (fr: string, ar: string, en: string, es: string, amz?: string) => {
    const map: Record<string, string> = { fr, ar, en, es, amz: amz || fr };
    return map[language] || fr;
  };

  const allServices = [
    {
      id: 'depot-legal',
      title: ml('Dépôt Légal', 'الإيداع القانوني', 'Legal Deposit', 'Depósito Legal', 'ⴰⵙⵔⵙ ⴰⵏⴰⵎⵓⵙ'),
      description: ml(
        'Déposez vos publications et documents selon la loi. Service obligatoire pour les éditeurs et auteurs.',
        'قم بإيداع مطبوعاتك ووثائقك وفقاً للقانون. خدمة إلزامية للناشرين والمؤلفين.',
        'Submit your publications and documents as required by law. Mandatory service for publishers and authors.',
        'Deposite sus publicaciones y documentos según la ley. Servicio obligatorio para editores y autores.',
        'ⵙⵔⵙ ⵜⵉⵥⵕⵉⴳⵉⵏ ⴷ ⵉⵙⴽⴽⵉⵍⵏ ⵏⵏⴽ ⵙ ⵓⵏⴰⵎⵓⵙ. ⵜⴰⵏⴰⴼⵓⵜ ⵜⵓⵙⵍⵉⴳⵜ ⵉ ⵉⵎⵥⵕⵉⴳⵏ.'
      ),
      category: ml('Service Essentiel', 'خدمة أساسية', 'Essential Service', 'Servicio Esencial', 'ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⴷⵙⵍⴰⵏⵜ'),
      onClick: () => navigate('/depot-legal')
    },
    {
      id: 'abonnements',
      title: ml('Abonnements à la BNRM', 'الاشتراكات في المكتبة الوطنية', 'BNRM Subscriptions', 'Suscripciones a la BNRM', 'ⵉⵎⵜⵜⴰⵡⵏ ⵖⵔ ⵜⵙⴷⵍⵉⵙⵜ'),
      description: ml(
        'Inscrivez-vous pour accéder aux ressources et services de la bibliothèque.',
        'سجل للوصول إلى موارد وخدمات المكتبة.',
        'Register to access the library\'s resources and services.',
        'Inscríbase para acceder a los recursos y servicios de la biblioteca.',
        'ⵙⵊⵊⵍ ⴰⴷ ⵜⴽⵛⵎⴷ ⵖⵔ ⵜⵖⴱⴰⵍⵓⵜⵉⵏ ⴷ ⵜⵉⵏⴰⴼⵓⵜⵉⵏ ⵏ ⵜⵙⴷⵍⵉⵙⵜ.'
      ),
      category: ml('Abonnement', 'اشتراك', 'Subscription', 'Suscripción', 'ⴰⵎⵜⵜⴰⵡ'),
      onClick: () => navigate('/abonnements?platform=portal')
    },
    {
      id: 'espaces-culturels',
      title: ml('Réservation des espaces culturels', 'حجز الفضاءات الثقافية', 'Cultural Spaces Booking', 'Reserva de espacios culturales', 'ⴰⵙⵎⵔⵙ ⵏ ⵉⵙⴰⵢⵔⴰⵔⵏ ⵉⴷⵍⵙⴰⵏⵏ'),
      description: ml(
        'Réservez nos espaces pour vos événements culturels et académiques.',
        'احجز فضاءاتنا لفعالياتك الثقافية والأكاديمية.',
        'Book our spaces for your cultural and academic events.',
        'Reserve nuestros espacios para sus eventos culturales y académicos.',
        'ⵙⵎⵔⵙ ⵉⵙⴰⵢⵔⴰⵔⵏ ⵏⵏⵖ ⵉ ⵜⵎⵙⴽⴰⵔⵉⵏ ⵏⵏⴽ ⵜⵉⴷⵍⵙⴰⵏⵉⵏ.'
      ),
      category: ml('Réservation', 'حجز', 'Booking', 'Reserva', 'ⴰⵙⵎⵔⵙ'),
      onClick: () => navigate('/reservation-espaces')
    },
    {
      id: 'pass-journalier',
      title: ml('Pass journalier', 'بطاقة يومية', 'Day Pass', 'Pase diario', 'ⵜⴰⴽⴰⵕⴹⴰ ⵏ ⵡⴰⵙⵙ'),
      description: ml(
        services.find(s => s.nom_service === 'Pass journalier')?.description || 'Accès gratuit à la bibliothèque pour une journée.',
        'دخول مجاني إلى المكتبة ليوم واحد.',
        'Free access to the library for one day.',
        'Acceso gratuito a la biblioteca por un día.',
        'ⴰⴽⵛⵎ ⵏ ⵍⵅⴰⵟⵔ ⵖⵔ ⵜⵙⴷⵍⵉⵙⵜ ⵉ ⵢⴰⵏ ⵡⴰⵙⵙ.'
      ),
      category: ml('Accès', 'وصول', 'Access', 'Acceso', 'ⴰⴽⵛⵎ'),
      onClick: () => navigate('/pass-journalier')
    },
    {
      id: 'reproduction',
      title: ml('Reproduction de documents', 'نسخ الوثائق', 'Document Reproduction', 'Reproducción de documentos', 'ⴰⵙⵏⵖⵍ ⵏ ⵉⵙⴽⴽⵉⵍⵏ'),
      description: ml(
        'Service de reproduction et numérisation de documents de la collection.',
        'خدمة نسخ ورقمنة الوثائق من المجموعة.',
        'Reproduction and digitization service for collection documents.',
        'Servicio de reproducción y digitalización de documentos de la colección.',
        'ⵜⴰⵏⴰⴼⵓⵜ ⵏ ⵓⵙⵏⵖⵍ ⴷ ⵜⵏⵓⵎⴰⵏⵜ ⵏ ⵉⵙⴽⴽⵉⵍⵏ.'
      ),
      category: ml('Service à la demande', 'خدمة حسب الطلب', 'On-demand Service', 'Servicio bajo demanda', 'ⵜⴰⵏⴰⴼⵓⵜ ⵙ ⵓⵙⵓⵜⵔ'),
      onClick: () => navigate('/reproduction')
    },
    {
      id: 'restauration',
      title: ml('Demande de restauration', 'طلب الترميم', 'Restoration Request', 'Solicitud de restauración', 'ⴰⵙⵓⵜⵔ ⵏ ⵓⵙⵖⵏⵓ'),
      description: ml(
        services.find(s => s.nom_service === 'Restauration')?.description || 'Service de restauration et conservation de documents anciens.',
        'خدمة ترميم وحفظ الوثائق القديمة.',
        'Restoration and conservation service for ancient documents.',
        'Servicio de restauración y conservación de documentos antiguos.',
        'ⵜⴰⵏⴰⴼⵓⵜ ⵏ ⵓⵙⵖⵏⵓ ⴷ ⵓⵃⵟⵟⵓ ⵏ ⵉⵙⴽⴽⵉⵍⵏ ⵉⵇⴱⵓⵔⵏ.'
      ),
      category: ml('Restauration', 'ترميم', 'Restoration', 'Restauración', 'ⴰⵙⵖⵏⵓ'),
      onClick: () => navigate('/demande-restauration')
    },
    {
      id: 'reservation-document',
      title: ml('Réserver un document', 'حجز وثيقة', 'Reserve a Document', 'Reservar un documento', 'ⵙⵎⵔⵙ ⵢⴰⵏ ⵓⵙⴽⴽⵉⵍ'),
      description: ml(
        'Réservez des documents pour consultation sur place.',
        'احجز الوثائق للاطلاع عليها في المكان.',
        'Reserve documents for on-site consultation.',
        'Reserve documentos para consulta in situ.',
        'ⵙⵎⵔⵙ ⵉⵙⴽⴽⵉⵍⵏ ⵉ ⵜⵖⵓⵔⵉ ⴳ ⵡⴰⵏⵙⴰ.'
      ),
      category: ml('Service à la demande', 'خدمة حسب الطلب', 'On-demand Service', 'Servicio bajo demanda', 'ⵜⴰⵏⴰⴼⵓⵜ ⵙ ⵓⵙⵓⵜⵔ'),
      onClick: () => navigate('/cbn/reserver-ouvrage')
    },
    {
      id: 'location',
      title: ml('Location à la demande', 'الإيجار حسب الطلب', 'On-demand Rental', 'Alquiler bajo demanda', 'ⴰⴽⵔⴰⵢ ⵙ ⵓⵙⵓⵜⵔ'),
      description: ml(
        'Service de location de documents et ressources.',
        'خدمة إيجار الوثائق والموارد.',
        'Document and resource rental service.',
        'Servicio de alquiler de documentos y recursos.',
        'ⵜⴰⵏⴰⴼⵓⵜ ⵏ ⵓⴽⵔⴰⵢ ⵏ ⵉⵙⴽⴽⵉⵍⵏ ⴷ ⵜⵖⴱⴰⵍⵓⵜⵉⵏ.'
      ),
      category: ml('Service à la demande', 'خدمة حسب الطلب', 'On-demand Service', 'Servicio bajo demanda', 'ⵜⴰⵏⴰⴼⵓⵜ ⵙ ⵓⵙⵓⵜⵔ'),
      onClick: () => navigate('/location-service')
    },
    {
      id: 'numerisation',
      title: ml('Demande de numérisation', 'طلب الرقمنة', 'Digitization Request', 'Solicitud de digitalización', 'ⴰⵙⵓⵜⵔ ⵏ ⵜⵏⵓⵎⴰⵏⵜ'),
      description: ml(
        services.find(s => s.nom_service === 'Numérisation documents rares')?.description || 'Service professionnel de numérisation de documents.',
        'خدمة احترافية لرقمنة الوثائق.',
        'Professional document digitization service.',
        'Servicio profesional de digitalización de documentos.',
        'ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⵥⵕⴼⴰⵏⵜ ⵏ ⵜⵏⵓⵎⴰⵏⵜ ⵏ ⵉⵙⴽⴽⵉⵍⵏ.'
      ),
      category: ml('Service à la demande', 'خدمة حسب الطلب', 'On-demand Service', 'Servicio bajo demanda', 'ⵜⴰⵏⴰⴼⵓⵜ ⵙ ⵓⵙⵓⵜⵔ'),
      onClick: () => navigate('/demande-numerisation')
    },
    {
      id: 'ewallet',
      title: ml('e-Wallet BNRM', 'المحفظة الإلكترونية', 'e-Wallet BNRM', 'e-Wallet BNRM', 'ⵜⴰⵡⵏⵏⴰⴼⵜ ⵜⴰⵍⵉⴽⵜⵕⵓⵏⵉⵜ'),
      description: ml(
        'Portefeuille électronique pour gérer vos paiements et transactions.',
        'محفظة إلكترونية لإدارة مدفوعاتك ومعاملاتك.',
        'Electronic wallet to manage your payments and transactions.',
        'Monedero electrónico para gestionar sus pagos y transacciones.',
        'ⵜⴰⵡⵏⵏⴰⴼⵜ ⵜⴰⵍⵉⴽⵜⵕⵓⵏⵉⵜ ⵉ ⵓⵙⵡⵓⴷⴷⵓ ⵏ ⵉⵅⵍⵍⵙⵏ ⵏⵏⴽ.'
      ),
      category: ml('Service numérique', 'خدمة رقمية', 'Digital Service', 'Servicio digital', 'ⵜⴰⵏⴰⴼⵓⵜ ⵜⴰⵏⵓⵎⴰⵏⵜ'),
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
          {ml('Voir tous nos services', 'عرض جميع الخدمات', 'View all our services', 'Ver todos nuestros servicios', 'ⵥⵕ ⵜⵉⵏⴰⴼⵓⵜⵉⵏ ⵏⵏⵖ ⴰⴽⴽⵯ')}
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
