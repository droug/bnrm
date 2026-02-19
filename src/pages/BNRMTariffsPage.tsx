import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { BNRMTariffs } from "@/components/bnrm/BNRMTariffs";
import { BNRMServices } from "@/components/bnrm/BNRMServices";
import { BNRMStatistics } from "@/components/bnrm/BNRMStatistics";
import { BNRMHistory } from "@/components/bnrm/BNRMHistory";
import { BNRMFreeRegistrations } from "@/components/bnrm/BNRMFreeRegistrations";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function BNRMTariffsPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useSecureRoles();
  const navigate = useNavigate();

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

            <TabsContent value="subscriptions" className="space-y-6 mt-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Gestion des Abonnements</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Services d'abonnement et tarifs associés
                </p>
              </div>
              <BNRMServices filterCategory="Abonnement" />
              <BNRMTariffs filterCategory="Abonnement" />
              <BNRMFreeRegistrations />
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
