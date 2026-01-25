import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useToast } from "@/hooks/use-toast";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import { PortalAnalyticsKPICard } from "@/components/dashboard/PortalAnalyticsKPICard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!rolesLoading && !isAdmin && !isLibrarian) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      navigate("/digital-library");
      return;
    }
  }, [user, isAdmin, isLibrarian, rolesLoading, navigate]);

  if (!user || rolesLoading) {
    return (
      <AdminPageWrapper
        title="Tableau de bord"
        description="Vue d'ensemble et KPIs"
        icon="mdi:view-dashboard-outline"
        iconColor="text-blue-600"
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
      title="Tableau de bord"
      description="Vue d'ensemble des statistiques et indicateurs clés de la Bibliothèque Numérique"
      icon="mdi:view-dashboard-outline"
      iconColor="text-blue-600"
    >
      <PortalAnalyticsKPICard platform="bn" showOnlyTab="digital-library" />
    </AdminPageWrapper>
  );
}
