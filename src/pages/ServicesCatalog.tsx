import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Printer, Users, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceRegistrationDialog } from "@/components/bnrm/ServiceRegistrationDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  bnrm_services?: {
    nom_service: string;
    categorie: string;
  };
}

export default function ServicesCatalog() {
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [selectedServiceForRegistration, setSelectedServiceForRegistration] = useState<BNRMService | null>(null);
  const [selectedTariffForRegistration, setSelectedTariffForRegistration] = useState<BNRMTariff | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("bnrm_services")
        .select("*")
        .order("nom_service");

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch tariffs with service information
      const { data: tariffsData, error: tariffsError } = await supabase
        .from("bnrm_tarifs")
        .select(`
          *,
          bnrm_services (
            nom_service,
            categorie
          )
        `)
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

  // Séparer les services d'abonnement (Inscription) et les services ponctuels (autres)
  const subscriptionServices = services.filter((service) => 
    service.categorie === "Inscription"
  );

  const oneTimeServices = services.filter((service) => 
    service.categorie !== "Inscription"
  );

  const filteredSubscriptionServices = subscriptionServices.filter((service) => {
    const matchesSearch = service.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredOneTimeServices = oneTimeServices.filter((service) => {
    const matchesSearch = service.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtenir les tarifs pour un service spécifique
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
    };
    const Icon = icons[category] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Catalogue de Services et Tarifs</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez l'ensemble des services proposés par la Bibliothèque Nationale du Royaume du Maroc et leurs tarifs associés.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs for Subscriptions and One-Time Services */}
          <Tabs defaultValue="abonnements" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="abonnements">Abonnements</TabsTrigger>
              <TabsTrigger value="services">Services Ponctuels</TabsTrigger>
            </TabsList>

            {/* Subscriptions Tab */}
            <TabsContent value="abonnements" className="space-y-6 mt-6">
              <div className="flex gap-4 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="Dépôt légal">Dépôt légal</SelectItem>
                    <SelectItem value="Reproduction">Reproduction</SelectItem>
                    <SelectItem value="Recherche">Recherche</SelectItem>
                    <SelectItem value="Numérisation">Numérisation</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubscriptionServices.map((service) => {
                  const serviceTariffs = getTariffsForService(service.id_service);
                  
                  return (
                    <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
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
                          
                          {/* Afficher les tarifs disponibles comme options */}
                          {serviceTariffs.length > 0 && (
                            <div className="space-y-2 pt-2 border-t">
                              <div className="font-semibold text-sm">Formules disponibles :</div>
                              {serviceTariffs.map((tariff) => (
                                <div key={tariff.id_tarif} className="bg-muted/30 p-3 rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                      <div className="font-medium">{tariff.condition_tarif}</div>
                                      {tariff.periode_validite && (
                                        <div className="text-xs text-muted-foreground">
                                          Validité: {tariff.periode_validite}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-lg font-bold text-primary">
                                      {tariff.montant} {tariff.devise}
                                    </div>
                                  </div>
                                </div>
                              ))}
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
                            setSelectedTariffForRegistration(null); // Ne pas présélectionner
                            setRegistrationDialogOpen(true);
                          }}
                        >
                          Inscription
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredSubscriptionServices.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun abonnement trouvé.
                </div>
              )}
            </TabsContent>

            {/* One-Time Services Tab */}
            <TabsContent value="services" className="space-y-6 mt-6">
              <div className="flex gap-4 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="Dépôt légal">Dépôt légal</SelectItem>
                    <SelectItem value="Reproduction">Reproduction</SelectItem>
                    <SelectItem value="Recherche">Recherche</SelectItem>
                    <SelectItem value="Numérisation">Numérisation</SelectItem>
                    <SelectItem value="Formation">Formation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOneTimeServices.map((service) => {
                  const serviceTariffs = getTariffsForService(service.id_service);
                  const firstTariff = serviceTariffs[0];
                  
                  return (
                    <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
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
                          
                          {/* Afficher le tarif si disponible */}
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
                          Réservation
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredOneTimeServices.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun service ponctuel trouvé.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {selectedServiceForRegistration && (
        <ServiceRegistrationDialog
          open={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
          service={selectedServiceForRegistration}
          tariff={selectedTariffForRegistration || undefined}
        />
      )}

      <Footer />
    </div>
  );
}
