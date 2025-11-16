import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Printer, Users, BookOpen, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceRegistrationDialog } from "@/components/bnrm/ServiceRegistrationDialog";
import { BoxReservationDialog } from "@/components/bnrm/BoxReservationDialog";
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
}

interface BNRMServicesPublicProps {
  filterType?: string; // "abonnements" ou "location"
}

export function BNRMServicesPublic({ filterType }: BNRMServicesPublicProps) {
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      
      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("bnrm_services")
        .select("*")
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

  // Services de location à la demande (S007 à S011)
  const locationServiceIds = ["S007", "S008", "S009", "S010", "S011"];
  const locationServices = services.filter((service) => 
    locationServiceIds.includes(service.id_service)
  );

  // Filtrer selon le type demandé
  let displaySubscriptions = true;
  let displayLocationServices = false;
  let displayOneTimeServices = false;

  if (filterType === "abonnements") {
    displaySubscriptions = true;
    displayLocationServices = false;
    displayOneTimeServices = false;
  } else if (filterType === "location") {
    displaySubscriptions = false;
    displayLocationServices = true;
    displayOneTimeServices = false;
  } else {
    // Par défaut, afficher tout
    displaySubscriptions = true;
    displayLocationServices = true;
    displayOneTimeServices = true;
  }

  const filteredOneTimeServices = oneTimeServices.filter((service) => {
    // Exclure les services de location qui seront affichés dans une carte séparée
    if (locationServiceIds.includes(service.id_service)) {
      return false;
    }
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
      "Boxes": Package,
    };
    const Icon = icons[category] || FileText;
    return <Icon className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {filterType === "abonnements" 
            ? "Abonnements BNRM" 
            : filterType === "location" 
            ? "Location à la demande" 
            : "Services de la BNRM"}
        </h1>
        <p className="text-xl text-muted-foreground">
          {filterType === "abonnements" 
            ? "Découvrez nos formules d'abonnement" 
            : filterType === "location" 
            ? "Louez nos espaces (Auditorium, Salles, Box)" 
            : "Découvrez tous nos services et abonnements"}
        </p>
      </div>

      {/* Search */}
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
      <Tabs defaultValue={filterType === "location" ? "services" : "abonnements"} className="w-full">
        {!filterType && (
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-11">
          <TabsTrigger value="abonnements" className="text-base font-medium">Abonnements</TabsTrigger>
          <TabsTrigger value="services" className="text-base font-medium">Services</TabsTrigger>
        </TabsList>
        )}

        {/* Subscriptions Tab */}
        {displaySubscriptions && <TabsContent value="abonnements" className="space-y-6 mt-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-11 text-base font-medium">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all" className="text-base">Toutes les catégories</SelectItem>
                <SelectItem value="Dépôt légal" className="text-base">Dépôt légal</SelectItem>
                <SelectItem value="Reproduction" className="text-base">Reproduction</SelectItem>
                <SelectItem value="Recherche" className="text-base">Recherche</SelectItem>
                <SelectItem value="Numérisation" className="text-base">Numérisation</SelectItem>
                <SelectItem value="Formation" className="text-base">Formation</SelectItem>
                <SelectItem value="Inscription" className="text-base">Inscription</SelectItem>
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
                        setSelectedTariffForRegistration(null);
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
        </TabsContent>}

        {/* One-Time Services Tab */}
        {(displayLocationServices || displayOneTimeServices) && <TabsContent value="services" className="space-y-6 mt-6">
          <div className="flex gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] h-11 text-base font-medium">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all" className="text-base">Toutes les catégories</SelectItem>
                <SelectItem value="Dépôt légal" className="text-base">Dépôt légal</SelectItem>
                <SelectItem value="Reproduction" className="text-base">Reproduction</SelectItem>
                <SelectItem value="Recherche" className="text-base">Recherche</SelectItem>
                <SelectItem value="Numérisation" className="text-base">Numérisation</SelectItem>
                <SelectItem value="Formation" className="text-base">Formation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Services Location à la demande - Grid Cards */}
          {displayLocationServices && locationServices.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Location à la demande</h3>
                <p className="text-sm text-muted-foreground">Réservez nos espaces et équipements pour vos événements et activités</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locationServices.map((service) => {
                  const serviceTariffs = getTariffsForService(service.id_service);
                  
                  return (
                    <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            <CardTitle className="text-lg">{service.nom_service}</CardTitle>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          Location d'espaces
                        </Badge>
                      </CardHeader>
                      <CardContent className="flex flex-col flex-1">
                        <div className="flex-1 space-y-3 mb-4">
                          {service.description && (
                            <CardDescription className="text-sm">
                              {service.description}
                            </CardDescription>
                          )}
                          
                          {/* Afficher les tarifs disponibles */}
                          {serviceTariffs.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground uppercase">Tarifs disponibles:</p>
                              {serviceTariffs.map((tariff) => (
                                <div key={tariff.id_tarif} className="p-2 bg-muted/30 rounded-md">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {tariff.montant} {tariff.devise}
                                      </p>
                                      {tariff.condition_tarif && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                          {tariff.condition_tarif}
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {tariff.periode_validite}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => {
                            if (service.id_service === "S011") {
                              setBoxTariff(serviceTariffs[0]);
                              setBoxReservationDialogOpen(true);
                            } else {
                              setSelectedServiceForRegistration(service);
                              setSelectedTariffForRegistration(serviceTariffs[0] || null);
                              setRegistrationDialogOpen(true);
                            }
                          }}
                          className="w-full"
                        >
                          Réserver
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {displayOneTimeServices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Special Box Reservation Card */}
            <Card className="hover:shadow-lg transition-shadow flex flex-col border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    <CardTitle className="text-lg">Réservation de Box</CardTitle>
                  </div>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  Boxes
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <div className="flex-1 space-y-3 mb-4">
                  <CardDescription className="text-sm">
                    Réservez un box de travail pour vos recherches à la BNRM. Espaces calmes et équipés.
                  </CardDescription>
                  <div className="text-sm">
                    <span className="font-semibold">Public cible : </span>
                    Chercheurs, étudiants, professionnels
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        50 DH
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Par jour
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setBoxTariff({ id_tarif: "T007", id_service: "S007", montant: 50, devise: "DH", condition_tarif: "Par jour", periode_validite: "2025", is_active: true });
                    setBoxReservationDialogOpen(true);
                  }}
                >
                  Réserver un box
                </Button>
              </CardContent>
            </Card>
            
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
          )}

          {displayOneTimeServices && filteredOneTimeServices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Aucun service trouvé.
            </div>
          )}
        </TabsContent>}
      </Tabs>

      {selectedServiceForRegistration && (
        <ServiceRegistrationDialog
          open={registrationDialogOpen}
          onOpenChange={setRegistrationDialogOpen}
          service={selectedServiceForRegistration}
          tariff={selectedTariffForRegistration || undefined}
        />
      )}
      
      <BoxReservationDialog
        open={boxReservationDialogOpen}
        onOpenChange={setBoxReservationDialogOpen}
        tariff={boxTariff}
      />
    </div>
  );
}
