import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import { PortalAnalyticsKPICard } from "@/components/dashboard/PortalAnalyticsKPICard";

export default function DigitalLibraryAnalytics() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Statistiques & Rapports"
        description="Analytics et export XLS/PDF"
        icon="mdi:chart-bar"
        iconColor="text-indigo-600"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminPageWrapper
      title="Statistiques & Rapports"
      description="Analyse détaillée de l'utilisation de la Bibliothèque Numérique avec exports"
      icon="mdi:chart-bar"
      iconColor="text-indigo-600"
    >
      <PortalAnalyticsKPICard platform="bn" defaultTab="digital-library" />
    </AdminPageWrapper>
  );
}
