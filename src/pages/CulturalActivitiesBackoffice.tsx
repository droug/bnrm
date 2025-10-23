import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CulturalActivitiesDashboard from "@/components/cultural-activities/CulturalActivitiesDashboard";
import SpaceReservationsBackoffice from "@/components/cultural-activities/SpaceReservationsBackoffice";
import GuidedToursBackoffice from "@/components/cultural-activities/GuidedToursBackoffice";
import PartnershipsBackoffice from "@/components/cultural-activities/PartnershipsBackoffice";
import { CulturalProgrammingTab } from "@/components/cultural-activities/CulturalProgrammingTab";
import { DocumentTemplatesManagement } from "@/components/cultural-activities/DocumentTemplatesManagement";

const CulturalActivitiesBackoffice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-foreground mb-2">
            Administration des Activités Culturelles
          </h1>
          <p className="text-muted-foreground font-light">
            Gestion centralisée de la plateforme d'activités culturelles
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="reservations">Réservations d'espaces</TabsTrigger>
            <TabsTrigger value="guided-tours">Visites guidées</TabsTrigger>
            <TabsTrigger value="partnerships">Partenariats</TabsTrigger>
            <TabsTrigger value="programming">Programmation culturelle</TabsTrigger>
            <TabsTrigger value="templates">Modèles de documents</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <CulturalActivitiesDashboard />
          </TabsContent>

          <TabsContent value="reservations">
            <SpaceReservationsBackoffice />
          </TabsContent>

          <TabsContent value="guided-tours">
            <GuidedToursBackoffice />
          </TabsContent>

          <TabsContent value="partnerships">
            <PartnershipsBackoffice />
          </TabsContent>

          <TabsContent value="programming">
            <CulturalProgrammingTab />
          </TabsContent>

          <TabsContent value="templates">
            <DocumentTemplatesManagement />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesBackoffice;
