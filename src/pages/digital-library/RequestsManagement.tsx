import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useToast } from "@/hooks/use-toast";
import { AdminPageWrapper, AdminSectionCard } from "@/components/digital-library/admin/AdminPageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";
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
      <AdminPageWrapper
        title="Gestion des Demandes"
        description="Réservations et numérisations"
        icon="mdi:folder-open-outline"
        iconColor="text-emerald-600"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  return (
    <AdminPageWrapper
      title="Gestion des Demandes"
      description="Gestion centralisée des demandes de réservation et de numérisation"
      icon="mdi:folder-open-outline"
      iconColor="text-emerald-600"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Icon icon="mdi:calendar-clock" className="h-4 w-4" />
            Réservations
          </TabsTrigger>
          <TabsTrigger value="digitization" className="flex items-center gap-2">
            <Icon icon="mdi:scanner" className="h-4 w-4" />
            Numérisation
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Icon icon="mdi:cog-outline" className="h-4 w-4" />
            Workflow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations">
          <AdminSectionCard
            title="Demandes de Réservation"
            description="Gérer les demandes de réservation de documents pour consultation sur place"
            icon="mdi:calendar-clock"
            iconBgColor="bg-blue-100 text-blue-600"
          >
            <ReservationRequestsTable />
          </AdminSectionCard>
        </TabsContent>

        <TabsContent value="digitization">
          <AdminSectionCard
            title="Demandes de Numérisation"
            description="Gérer les demandes de numérisation de documents avec workflow de validation"
            icon="mdi:scanner"
            iconBgColor="bg-purple-100 text-purple-600"
          >
            <DigitizationRequestsTable />
          </AdminSectionCard>
        </TabsContent>

        <TabsContent value="workflow">
          <AdminSectionCard
            title="Paramètres Workflow"
            description="Configurer les statuts, circuits de validation et rôles autorisés"
            icon="mdi:cog-outline"
            iconBgColor="bg-gray-100 text-gray-600"
          >
            <RequestsWorkflowSettings />
          </AdminSectionCard>
        </TabsContent>
      </Tabs>
    </AdminPageWrapper>
  );
}
