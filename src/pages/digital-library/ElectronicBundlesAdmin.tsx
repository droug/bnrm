import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import ElectronicBundlesManagement from "@/components/digital-library/admin/ElectronicBundlesManagement";

export default function ElectronicBundlesAdmin() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Bouquets électroniques"
        description="Configurer les abonnements aux ressources électroniques"
        icon="mdi:earth"
        iconColor="text-sky-600"
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
      title="Bouquets électroniques"
      description="Configurer les abonnements aux ressources électroniques externes (CAIRN, BRILL, Europeana, etc.)"
      icon="mdi:earth"
      iconColor="text-sky-600"
    >
      <ElectronicBundlesManagement />
    </AdminPageWrapper>
  );
}
