import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceRegistrationDialog } from "@/components/bnrm/ServiceRegistrationDialog";
import { Link } from "react-router-dom";

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

export default function Abonnements() {
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [selectedServiceForRegistration, setSelectedServiceForRegistration] = useState<BNRMService | null>(null);
  const [selectedTariffForRegistration, setSelectedTariffForRegistration] = useState<BNRMTariff | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch only specific subscription services
      const allowedServiceIds = ["I001", "I002", "I003", "S001", "S002", "S003"];
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Abonnements BNRM
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Découvrez nos différentes formules d'abonnement à la Bibliothèque Nationale
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un abonnement..."
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
              const firstTariff = serviceTariffs[0];
              
              return (
                <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        <CardTitle className="text-lg">{service.nom_service}</CardTitle>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      Abonnement
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
                      
                      {firstTariff && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              {firstTariff.montant} {firstTariff.devise}
                            </span>
                          </div>
                          {firstTariff.condition_tarif && (
                            <div className="text-sm text-muted-foreground">
                              {firstTariff.condition_tarif}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {service.reference_legale && (
                        <div className="text-xs text-muted-foreground">
                          Référence légale : {service.reference_legale}
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedServiceForRegistration(service);
                        setSelectedTariffForRegistration(firstTariff || null);
                        setRegistrationDialogOpen(true);
                      }}
                    >
                      S'abonner
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun abonnement trouvé.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
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
    </div>
  );
}
