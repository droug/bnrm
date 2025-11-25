import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  handleLegalDepositClick: (type: "monographie" | "periodique" | "bd_logiciels" | "collections_specialisees") => void;
}

export function DigitalServicesCarousel({ language, handleLegalDepositClick }: DigitalServicesCarouselProps) {
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
        .order("nom_service")
        .limit(6);

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

  const getServiceImage = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      "https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80",
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
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
      readTime: language === 'ar' ? '5 دقائق' : '5 min read',
      onClick: () => handleLegalDepositClick("monographie")
    },
    ...services.map((service, index) => ({
      id: service.id_service,
      title: service.nom_service,
      description: service.description || '',
      category: service.categorie,
      readTime: language === 'ar' ? '5 دقائق' : '5 min read',
      onClick: () => navigate('/services-bnrm')
    }))
  ];

  return (
    <div className="relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {allServices.map((service, index) => (
            <CarouselItem key={service.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
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
                  {/* Category and Read Time */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                      {service.category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {service.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
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
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === current 
                  ? 'w-8 bg-orange-500' 
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
            disabled={current === 0}
            className={`p-3 rounded-lg transition-colors ${
              current === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => api?.scrollNext()}
            disabled={current === count - 1}
            className={`p-3 rounded-lg transition-colors ${
              current === count - 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
