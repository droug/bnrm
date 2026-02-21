import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Printer, Users, BookOpen, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceRegistrationDialog } from "@/components/bnrm/ServiceRegistrationDialog";
import { BoxReservationDialog } from "@/components/bnrm/BoxReservationDialog";
import { Link } from "react-router-dom";
import { ServicePageBackground } from "@/components/ServicePageBackground";

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

export default function ReservationEspaces() {
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [boxReservationDialogOpen, setBoxReservationDialogOpen] = useState(false);
  const [selectedServiceForRegistration, setSelectedServiceForRegistration] = useState<BNRMService | null>(null);
  const [selectedTariffForRegistration, setSelectedTariffForRegistration] = useState<BNRMTariff | null>(null);
  const [boxTariff, setBoxTariff] = useState<BNRMTariff | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch only specific space/service services including Box reservation
      const allowedServiceIds = ["S007", "S008", "S009", "S010", "S011"];
      const { data: servicesData, error: servicesError } = await supabase
        .from("bnrm_services")
        .select("*")
        .in("id_service", allowedServiceIds)
        .order("nom_service");

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch active tariffs
      const { data: tariffsData, error: tariffsError } = await supabase
        .from("bnrm_tarifs")
        .select("*")
        .eq("is_active", true)
        .order("montant");

      if (tariffsError) throw tariffsError;
      setTariffs(tariffsData || []);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      "Boxes": "bg-purple-100 text-purple-800",
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
      "Boxes": Package,
    };
    const Icon = icons[category] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ServicePageBackground />
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Réservez nos espaces
            </h1>
            <p className="text-muted-foreground text-lg">
              Découvrez nos services et espaces disponibles à la réservation
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const serviceTariffs = getTariffsForService(service.id_service);
              
              // Gérer le cas spécial de la réservation de box (S011)
              const isBoxReservation = service.id_service === "S011";
              
              return (
                <Card key={service.id_service} className={`hover:shadow-lg transition-shadow flex flex-col ${isBoxReservation ? 'border-primary/50' : ''}`}>
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
                      
                      {service.reference_legale && (
                        <div className="text-sm">
                          <span className="font-semibold">Référence légale : </span>
                          {service.reference_legale}
                        </div>
                      )}
                      
                      {serviceTariffs.length > 0 && (
                        <div className="pt-2 border-t">
                          <div className="font-semibold text-sm mb-2">Tarifs</div>
                          <div className="space-y-2">
                            {serviceTariffs.map((tariff) => (
                              <div key={tariff.id_tarif} className="p-2 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-primary">
                                    {tariff.montant} {tariff.devise}
                                  </span>
                                </div>
                                {tariff.condition_tarif && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {tariff.condition_tarif}
                                  </div>
                                )}
                                {tariff.periode_validite && (
                                  <div className="text-xs text-muted-foreground">
                                    Période: {tariff.periode_validite}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        if (isBoxReservation) {
                          setBoxTariff(serviceTariffs[0]);
                          setBoxReservationDialogOpen(true);
                        } else {
                          setSelectedServiceForRegistration(service);
                          setSelectedTariffForRegistration(serviceTariffs[0] || null);
                          setRegistrationDialogOpen(true);
                        }
                      }}
                    >
                      {isBoxReservation ? "Réserver un box" : "Réservation"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun service trouvé.
            </div>
          )}
        </div>
      </main>
      
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />

      {/* Registration Dialog - only render when service exists */}
      {selectedServiceForRegistration && (
        <ServiceRegistrationDialog
          open={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
          service={selectedServiceForRegistration}
          tariff={selectedTariffForRegistration}
        />
      )}

      {/* Box Reservation Dialog */}
      <BoxReservationDialog
        open={boxReservationDialogOpen}
        onOpenChange={setBoxReservationDialogOpen}
        tariff={boxTariff}
      />
    </div>
  );
}
