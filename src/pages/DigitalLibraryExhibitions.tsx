import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import ExhibitionsManager from "@/components/digital-library/ExhibitionsManager";

export default function DigitalLibraryExhibitions() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Expositions virtuelles"
        description="Gestion des expositions"
        icon="mdi:rotate-3d-variant"
        iconColor="text-teal-600"
        iconBgColor="bg-teal-500/10"
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
      title="Expositions virtuelles"
      description="Création et gestion des expositions virtuelles immersives"
      icon="mdi:rotate-3d-variant"
      iconColor="text-teal-600"
      iconBgColor="bg-teal-500/10"
    >
      <ExhibitionsManager />
    </AdminPageWrapper>
  );
}
