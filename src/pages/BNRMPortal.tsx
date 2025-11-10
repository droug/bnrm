import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { BNRMServicesPublic } from "@/components/bnrm/BNRMServicesPublic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ChevronDown, FileText, Printer, Search, BookOpen, Users, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceRegistrationDialog } from "@/components/bnrm/ServiceRegistrationDialog";
import { BoxReservationDialog } from "@/components/bnrm/BoxReservationDialog";
import { useToast } from "@/hooks/use-toast";

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

export default function BNRMPortal() {
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [services, setServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [boxReservationDialogOpen, setBoxReservationDialogOpen] = useState(false);
  const [selectedServiceForRegistration, setSelectedServiceForRegistration] = useState<BNRMService | null>(null);
  const [selectedTariffForRegistration, setSelectedTariffForRegistration] = useState<BNRMTariff | null>(null);
  const [boxTariff, setBoxTariff] = useState<BNRMTariff | undefined>(undefined);
  const { toast } = useToast();

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      
      const { data: servicesData, error: servicesError } = await supabase
        .from("bnrm_services")
        .select("*")
        .neq("categorie", "Inscription")
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

  const handleShowServices = () => {
    fetchServicesData();
    setShowServicesDialog(true);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Portail BNRM
              </h1>
              <Badge variant="secondary" className="ml-2">
                Bibliothèque Nationale du Royaume du Maroc
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg mb-4">
              Abonnements, services et tarifs de la Bibliothèque Nationale du Royaume du Maroc
            </p>

            {/* Menu "Accéder à nos services" */}
            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Accéder à nos services
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleShowServices}>
                    Réservez nos espaces
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Main Content - Public Services */}
          <BNRMServicesPublic />
        </div>
      </main>
      
      <Footer />
      
      {/* Outils globaux (Accessibilité + Chatbot) */}
      <GlobalAccessibilityTools />

      {/* Dialog for Services */}
      <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Réservez nos espaces</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
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
                      setShowServicesDialog(false);
                    }}
                  >
                    Réserver un box
                  </Button>
                </CardContent>
              </Card>
              
              {services.map((service) => {
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
                          setShowServicesDialog(false);
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
        </DialogContent>
      </Dialog>

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