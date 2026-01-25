import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import UsersManager from "@/components/digital-library/UsersManager";

export default function DigitalLibraryUsers() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Gestion des utilisateurs"
        description="Utilisateurs et droits d'accès"
        icon="mdi:account-group-outline"
        iconColor="text-purple-600"
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
      title="Gestion des utilisateurs"
      description="Gestion des comptes utilisateurs, rôles et permissions d'accès"
      icon="mdi:account-group-outline"
      iconColor="text-purple-600"
    >
      <UsersManager />
    </AdminPageWrapper>
  );
}
