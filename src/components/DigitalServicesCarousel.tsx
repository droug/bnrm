import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Search, BookOpen, Users } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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

  useEffect(() => {
    fetchServices();
  }, []);

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

  const getTariffsForService = (serviceId: string) => {
    return tariffs.filter(t => t.id_service === serviceId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Dépôt légal": "bg-blue-100 text-blue-800",
      "Reproduction": "bg-green-100 text-green-800",
      "Recherche": "bg-purple-100 text-purple-800",
      "Numérisation": "bg-orange-100 text-orange-800",
      "Formation": "bg-pink-100 text-pink-800",
      "Inscription": "bg-blue-100 text-blue-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      "Dépôt légal": FileText,
      "Reproduction": Printer,
      "Recherche": Search,
      "Numérisation": BookOpen,
      "Formation": Users,
      "Inscription": Users,
    };
    const Icon = icons[category] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {/* Premier élément - Dépôt Légal */}
        <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/3">
          <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <CardTitle className="text-lg">
                    {language === 'ar' ? 'الإيداع القانوني' : 'Dépôt Légal'}
                  </CardTitle>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-800 w-fit">
                Service Essentiel
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <div className="flex-1 space-y-3 mb-4">
                <CardDescription className="text-sm">
                  {language === 'ar'
                    ? 'قم بإيداع مطبوعاتك ووثائقك وفقاً للقانون. خدمة إلزامية للناشرين والمؤلفين.'
                    : 'Déposez vos publications et documents selon la loi. Service obligatoire pour les éditeurs et auteurs.'}
                </CardDescription>
                <div className="text-sm">
                  <span className="font-semibold">
                    {language === 'ar' ? 'الأنواع المتاحة :' : 'Types disponibles :'}
                  </span>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>{language === 'ar' ? 'الكتب والمنشورات' : 'Livres et monographies'}</li>
                    <li>{language === 'ar' ? 'الدوريات والمجلات' : 'Périodiques et magazines'}</li>
                    <li>{language === 'ar' ? 'السمعي البصري' : 'Audio-visuel et logiciels'}</li>
                    <li>{language === 'ar' ? 'المجموعات المتخصصة' : 'Collections spécialisées'}</li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={() => handleLegalDepositClick("monographie")}
              >
                {language === 'ar' ? 'ابدأ الإيداع' : 'Commencer le dépôt'}
              </Button>
            </CardContent>
          </Card>
        </CarouselItem>

        {/* Services depuis la base de données */}
        {services.map((service) => {
          const serviceTariffs = getTariffsForService(service.id_service);
          
          return (
            <CarouselItem key={service.id_service} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(service.categorie)}
                      <CardTitle className="text-lg">{service.nom_service}</CardTitle>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(service.categorie)}>
                    {service.categorie}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className="flex-1 space-y-3 mb-4">
                    {service.description && (
                      <CardDescription className="text-sm">
                        {service.description}
                      </CardDescription>
                    )}
                    {service.public_cible && (
                      <div className="text-sm">
                        <span className="font-semibold">Public cible : </span>
                        {service.public_cible}
                      </div>
                    )}
                    
                    {serviceTariffs.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="font-semibold text-sm">Tarifs :</div>
                        {serviceTariffs.slice(0, 2).map((tariff) => (
                          <div key={tariff.id_tarif} className="bg-muted/30 p-2 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="text-xs">
                                <div className="font-medium">{tariff.condition_tarif}</div>
                              </div>
                              <div className="text-sm font-bold text-primary">
                                {tariff.montant} {tariff.devise}
                              </div>
                            </div>
                          </div>
                        ))}
                        {serviceTariffs.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{serviceTariffs.length - 2} autres tarifs disponibles
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/services-bnrm')}
                  >
                    {language === 'ar' ? 'اكتشف المزيد' : 'En savoir plus'}
                  </Button>
                </CardContent>
              </Card>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
    </Carousel>
  );
}
