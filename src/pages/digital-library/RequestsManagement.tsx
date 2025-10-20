import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, Settings, FolderOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ReservationRequestsTable } from "@/components/digital-library/admin/ReservationRequestsTable";
import { DigitizationRequestsTable } from "@/components/digital-library/admin/DigitizationRequestsTable";
import { RequestsWorkflowSettings } from "@/components/digital-library/admin/RequestsWorkflowSettings";

export default function RequestsManagement() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reservations");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!loading && !isAdmin && !isLibrarian) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      navigate("/digital-library");
    }
  }, [user, isAdmin, isLibrarian, loading, navigate]);

  if (!user || loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <FolderOpen className="h-10 w-10" />
            Gestion des Demandes - Bibliothèque Numérique
          </h1>
          <p className="text-lg text-muted-foreground">
            Gestion centralisée des demandes de réservation et de numérisation
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Demandes de Réservation
            </TabsTrigger>
            <TabsTrigger value="digitization" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Demandes de Numérisation
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres Workflow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Demandes de Réservation
                </CardTitle>
                <CardDescription>
                  Gérer les demandes de réservation de documents pour consultation sur place
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationRequestsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="digitization">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Demandes de Numérisation
                </CardTitle>
                <CardDescription>
                  Gérer les demandes de numérisation de documents avec workflow de validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DigitizationRequestsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres Workflow
                </CardTitle>
                <CardDescription>
                  Configurer les statuts, circuits de validation et rôles autorisés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsWorkflowSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
