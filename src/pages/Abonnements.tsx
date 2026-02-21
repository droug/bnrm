// Abonnements - Page de gestion des abonnements (multi-plateforme)
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalAccessibilityTools } from "@/components/GlobalAccessibilityTools";
import { ServicePageBackground } from "@/components/ServicePageBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserCheck, ArrowLeft, CreditCard, Gift, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ServiceRegistrationSheet } from "@/components/bnrm/ServiceRegistrationSheet";
import { FreeRegistrationSheet } from "@/components/bnrm/FreeRegistrationSheet";
import { Link } from "react-router-dom";

interface BNRMService {
  id_service: string;
  categorie: string;
  nom_service: string;
  description: string | null;
  public_cible: string | null;
  reference_legale: string | null;
  is_free: boolean | null;
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
  const [searchParams] = useSearchParams();
  const [paidServices, setPaidServices] = useState<BNRMService[]>([]);
  const [freeServices, setFreeServices] = useState<BNRMService[]>([]);
  const [tariffs, setTariffs] = useState<BNRMTariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [registrationSheetOpen, setRegistrationSheetOpen] = useState(false);
  const [freeSheetOpen, setFreeSheetOpen] = useState(false);
  const [selectedServiceForRegistration, setSelectedServiceForRegistration] = useState<BNRMService | null>(null);
  const [selectedTariffForRegistration, setSelectedTariffForRegistration] = useState<BNRMTariff | null>(null);
  const [selectedFreeService, setSelectedFreeService] = useState<BNRMService | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const platformParam = searchParams.get('platform');
  const isPortal = platformParam === 'portal';

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-restore pending subscription after login
  useEffect(() => {
    if (!user || loading || paidServices.length === 0) return;

    const pendingData = sessionStorage.getItem('pendingSubscription');
    if (!pendingData) return;

    try {
      const parsed = JSON.parse(pendingData);
      const service = paidServices.find(s => s.id_service === parsed.serviceId);
      if (service) {
        const serviceTariffs = tariffs.filter(t => t.id_service === service.id_service);
        const tariff = parsed.selectedTariffId
          ? serviceTariffs.find(t => t.id_tarif === parsed.selectedTariffId)
          : serviceTariffs[0];

        setSelectedServiceForRegistration(service);
        setSelectedTariffForRegistration(tariff || null);
        setRegistrationSheetOpen(true);

        toast({
          title: "Données restaurées",
          description: "Vos informations ont été conservées. Vous pouvez finaliser votre inscription.",
        });
      }
    } catch {
      sessionStorage.removeItem('pendingSubscription');
    }
  }, [user, loading, paidServices, tariffs]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const allowedServiceIds = ["I001", "I002", "I003", "S001", "S002", "S003"];
      const { data: paidData, error: paidError } = await supabase
        .from("bnrm_services")
        .select("*")
        .in("id_service", allowedServiceIds)
        .order("nom_service");
      if (paidError) throw paidError;
      setPaidServices(paidData || []);

      const { data: freeData, error: freeError } = await supabase
        .from("bnrm_services")
        .select("*")
        .eq("is_free", true)
        .order("id_service");
      if (freeError) throw freeError;
      setFreeServices(freeData || []);

      const { data: tariffsData, error: tariffsError } = await supabase
        .from("bnrm_tarifs")
        .select("*")
        .eq("is_active", true)
        .order("montant");
      if (tariffsError) throw tariffsError;
      setTariffs(tariffsData || []);

    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getTariffsForService = (serviceId: string) => tariffs.filter(t => t.id_service === serviceId);

  const config = isPortal ? {
    backLink: "/",
    backLabel: "Retour à l'accueil",
    title: "Abonnements BNRM",
    subtitle: "Découvrez nos différentes formules d'abonnement à la Bibliothèque Nationale",
    iconColor: "text-primary",
    badgeClass: "bg-primary/10 text-primary",
    spinnerColor: "border-primary",
  } : {
    backLink: "/digital-library",
    backLabel: "Retour à la bibliothèque numérique",
    title: "Abonnements",
    subtitle: "Découvrez nos différentes formules d'abonnement à la Bibliothèque Numérique Marocaine",
    iconColor: "text-bn-blue-primary",
    badgeClass: "bg-bn-blue-primary/10 text-bn-blue-primary",
    spinnerColor: "border-bn-blue-primary",
  };

  const filteredPaid = paidServices.filter(s =>
    s.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFree = freeServices.filter(s =>
    s.nom_service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link to={config.backLink} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {config.backLabel}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className={`h-8 w-8 ${config.iconColor}`} />
            <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
          </div>
          <p className="text-muted-foreground text-lg">{config.subtitle}</p>
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

        {/* Tabs */}
        <Tabs defaultValue="payantes" className="w-full">
          <TabsList className="mb-6 h-11">
            <TabsTrigger value="payantes" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Inscriptions payantes
              <Badge variant="secondary" className="ml-1 text-xs">{filteredPaid.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="gratuites" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Inscriptions gratuites
              <Badge variant="secondary" className="ml-1 text-xs">{filteredFree.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Paid tab */}
          <TabsContent value="payantes">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaid.map((service) => {
                const serviceTariffs = getTariffsForService(service.id_service);
                return (
                  <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5" />
                          <CardTitle className="text-lg">{service.nom_service}</CardTitle>
                        </div>
                      </div>
                      <Badge className={config.badgeClass}>Abonnement</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex-1 space-y-3 mb-4">
                        {service.description && (
                          <CardDescription className="text-sm">{service.description}</CardDescription>
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
                                    <div className="text-xs text-muted-foreground mt-1">{tariff.condition_tarif}</div>
                                  )}
                                  {tariff.periode_validite && (
                                    <div className="text-xs text-muted-foreground">Période: {tariff.periode_validite}</div>
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
                          setSelectedServiceForRegistration(service);
                          setSelectedTariffForRegistration(serviceTariffs[0] || null);
                          setRegistrationSheetOpen(true);
                        }}
                      >
                        S'abonner
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filteredPaid.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Aucun abonnement trouvé.</div>
            )}
          </TabsContent>

          {/* Free tab */}
          <TabsContent value="gratuites">
            <div className="mb-4 p-4 rounded-lg bg-muted/40 border text-sm text-muted-foreground flex items-start gap-2">
              <Gift className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Ces catégories bénéficient d'un accès gratuit à la bibliothèque — Décision 2025</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFree.map((service) => (
                <Card key={service.id_service} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{service.id_service}</Badge>
                        <Badge className="bg-primary/10 text-primary border-0">Gratuit</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{service.nom_service}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-3">
                    {service.description && (
                      <div>
                        <span className="font-semibold text-sm">Condition :</span>
                        <p className="text-muted-foreground text-sm mt-0.5">{service.description}</p>
                      </div>
                    )}
                    {service.public_cible && (
                      <div>
                        <span className="font-semibold text-sm">Salles :</span>
                        <p className="text-muted-foreground text-sm mt-0.5">{service.public_cible}</p>
                      </div>
                    )}
                    {service.reference_legale && (
                      <div className="text-sm text-muted-foreground pt-2 border-t border-border">
                        {service.reference_legale}
                      </div>
                    )}
                    <div className="flex-1" />
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-sm text-primary font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Accès gratuit — aucun frais requis
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedFreeService(service);
                          setFreeSheetOpen(true);
                        }}
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Demander l'abonnement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredFree.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Aucune inscription gratuite trouvée.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sheet pour inscriptions payantes */}
      {selectedServiceForRegistration && (
        <ServiceRegistrationSheet
          open={registrationSheetOpen}
          onOpenChange={setRegistrationSheetOpen}
          service={selectedServiceForRegistration}
          tariff={selectedTariffForRegistration}
        />
      )}

      {/* Sheet pour inscriptions gratuites */}
      {selectedFreeService && (
        <FreeRegistrationSheet
          open={freeSheetOpen}
          onOpenChange={setFreeSheetOpen}
          service={selectedFreeService}
        />
      )}
    </div>
  );

  if (loading) {
    if (isPortal) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${config.spinnerColor}`}></div>
            </div>
          </main>
          <Footer />
        </div>
      );
    }
    return (
      <DigitalLibraryLayout>
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${config.spinnerColor}`}></div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (isPortal) {
    return (
      <div className="min-h-screen bg-background relative">
        <ServicePageBackground />
        <Header />
        <main className="relative z-10">{content}</main>
        <div className="relative z-10 bg-background">
          <Footer />
        </div>
        <GlobalAccessibilityTools />
      </div>
    );
  }

  return (
    <DigitalLibraryLayout>
      {content}
    </DigitalLibraryLayout>
  );
}
