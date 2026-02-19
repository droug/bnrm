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
import { ArrowLeft, ChevronDown, BookOpen, CreditCard, Gift } from "lucide-react";
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
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Services et Tarifs BNRM</h1>
            <p className="text-muted-foreground">
              Gérer les services, tarifs, et suivre les statistiques de la Bibliothèque Nationale du Royaume du Maroc
            </p>
          </div>
          
          <Tabs defaultValue="subscriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="statistics">Statistiques</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="space-y-4 mt-6">

              {/* Accordéon 1 : Services */}
              <Collapsible open={openServices} onOpenChange={setOpenServices}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="text-base font-semibold">Inscriptions payantes</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openServices ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 px-1">
                  <BNRMServices filterCategory="Abonnement" />
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon 2 : Inscriptions gratuites */}
              <Collapsible open={openFree} onOpenChange={setOpenFree}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="text-base font-semibold">Inscriptions gratuites</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openFree ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 px-1">
                  <BNRMFreeRegistrations />
                </CollapsibleContent>
              </Collapsible>

              {/* Accordéon 3 : Tarifs (en dernier) */}
              <Collapsible open={openTariffs} onOpenChange={setOpenTariffs}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <span className="text-base font-semibold">Tarifs</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openTariffs ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 px-1">
                  <BNRMTariffs filterCategory="Abonnement" />
                </CollapsibleContent>
              </Collapsible>

            </TabsContent>

            <TabsContent value="services" className="space-y-6 mt-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Gestion des Services Ponctuels</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Services à la demande et tarifs associés
                </p>
              </div>
              <BNRMServices filterCategory="Service à la demande" />
              <BNRMTariffs filterCategory="Service à la demande" />
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6 mt-6">
              <BNRMStatistics />
            </TabsContent>

            <TabsContent value="history" className="space-y-6 mt-6">
              <BNRMHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WatermarkContainer>
  );
}
