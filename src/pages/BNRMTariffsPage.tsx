import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { BNRMTariffs } from "@/components/bnrm/BNRMTariffs";
import { BNRMServices } from "@/components/bnrm/BNRMServices";
import { BNRMStatistics } from "@/components/bnrm/BNRMStatistics";
import { BNRMHistory } from "@/components/bnrm/BNRMHistory";
import { BNRMFreeRegistrations } from "@/components/bnrm/BNRMFreeRegistrations";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, ChevronDown, BookOpen, CreditCard, Gift, Wrench, Copy, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useState } from "react";

export default function BNRMTariffsPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useSecureRoles();
  const navigate = useNavigate();

  const [openServices, setOpenServices] = useState(false);
  const [openTariffs, setOpenTariffs] = useState(false);
  const [openFree, setOpenFree] = useState(false);
  
  // Services tab accordions
  const [openServDemande, setOpenServDemande] = useState(false);
  const [openServReproduction, setOpenServReproduction] = useState(false);
  const [openServRestauration, setOpenServRestauration] = useState(false);
  const [openTarifsDemande, setOpenTarifsDemande] = useState(false);
  const [openTarifsReproduction, setOpenTarifsReproduction] = useState(false);
  const [openTarifsRestauration, setOpenTarifsRestauration] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <WatermarkContainer>
      <div className="min-h-screen bg-muted/30">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-6 py-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Services et Tarifs BNRM</h1>
            <p className="mt-1 text-primary-foreground/75 text-sm">
              Gérer les services, tarifs, et suivre les statistiques de la Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="subscriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 rounded-xl h-12 bg-background border shadow-sm">
              <TabsTrigger value="subscriptions" className="rounded-lg text-sm font-medium">Abonnements</TabsTrigger>
              <TabsTrigger value="services" className="rounded-lg text-sm font-medium">Services</TabsTrigger>
              <TabsTrigger value="statistics" className="rounded-lg text-sm font-medium">Statistiques</TabsTrigger>
              <TabsTrigger value="history" className="rounded-lg text-sm font-medium">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="space-y-4">

              {/* Accordéon 1 : Inscriptions payantes */}
              <Collapsible open={openServices} onOpenChange={setOpenServices}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Inscriptions payantes</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Services d'abonnement payants</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openServices ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4 space-y-6">
                    <h3 className="text-base font-semibold text-foreground border-b pb-2">Services</h3>
                    <BNRMServices filterCategory="Abonnement" />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon 2 : Inscriptions gratuites */}
              <Collapsible open={openFree} onOpenChange={setOpenFree}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Gift className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Inscriptions gratuites</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Accès libre sans frais d'abonnement</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openFree ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4">
                    <BNRMFreeRegistrations />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon 3 : Tarifs */}
              <Collapsible open={openTariffs} onOpenChange={setOpenTariffs}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Tarifs</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Grille tarifaire des abonnements</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openTariffs ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4 space-y-6">
                    <h3 className="text-base font-semibold text-foreground border-b pb-2">Tarifs</h3>
                    <BNRMTariffs filterCategory="Abonnement" />
                  </div>
                </CollapsibleContent>
              </Collapsible>

            </TabsContent>

            <TabsContent value="services" className="space-y-4">

              {/* Accordéon : Services à la demande */}
              <Collapsible open={openServDemande} onOpenChange={setOpenServDemande}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Wrench className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Services à la demande</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Photocopie, impression, numérisation et services ponctuels</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openServDemande ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4 space-y-6">
                    <h3 className="text-base font-semibold text-foreground border-b pb-2">Services</h3>
                    <BNRMServices filterCategory="Service à la demande" />
                    <Collapsible open={openTarifsDemande} onOpenChange={setOpenTarifsDemande}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between py-2 border-b group">
                          <h3 className="text-base font-semibold text-foreground">Tarifs</h3>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openTarifsDemande ? "rotate-180" : ""}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <BNRMTariffs filterCategory="Service à la demande" />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon : Reproduction */}
              <Collapsible open={openServReproduction} onOpenChange={setOpenServReproduction}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Copy className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Reproduction</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Microfilm, papier, numérique, collections spécialisées et audiovisuel</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openServReproduction ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4 space-y-6">
                    <h3 className="text-base font-semibold text-foreground border-b pb-2">Services</h3>
                    <BNRMServices filterCategory="Reproduction" />
                    <Collapsible open={openTarifsReproduction} onOpenChange={setOpenTarifsReproduction}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between py-2 border-b group">
                          <h3 className="text-base font-semibold text-foreground">Tarifs</h3>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openTarifsReproduction ? "rotate-180" : ""}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <BNRMTariffs filterCategory="Reproduction" />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon : Restauration */}
              <Collapsible open={openServRestauration} onOpenChange={setOpenServRestauration}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-background shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                        <Hammer className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold text-foreground">Restauration</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Services de restauration de documents</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openServRestauration ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <div className="rounded-xl border bg-background shadow-sm p-4 space-y-6">
                    <h3 className="text-base font-semibold text-foreground border-b pb-2">Services</h3>
                    <BNRMServices filterCategory="Restauration" />
                    <Collapsible open={openTarifsRestauration} onOpenChange={setOpenTarifsRestauration}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between py-2 border-b group">
                          <h3 className="text-base font-semibold text-foreground">Tarifs</h3>
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openTarifsRestauration ? "rotate-180" : ""}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <BNRMTariffs filterCategory="Restauration" />
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CollapsibleContent>
              </Collapsible>

            </TabsContent>

            <TabsContent value="statistics">
              <div className="rounded-xl border bg-background shadow-sm p-6">
                <BNRMStatistics />
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="rounded-xl border bg-background shadow-sm p-6">
                <BNRMHistory />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WatermarkContainer>
  );
}
