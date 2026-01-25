import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import DocumentsManager from "@/components/digital-library/DocumentsManager";

export default function DigitalLibraryDocuments() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Gestion des Documents Numérisés"
        description="Catalogage et gestion des fonds documentaires"
        icon="mdi:file-document-multiple-outline"
        iconColor="text-blue-600"
        iconBgColor="bg-blue-500/10"
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
      title="Gestion des Documents Numérisés"
      description="Interface d'administration pour la gestion des documents numérisés de la bibliothèque"
      icon="mdi:file-document-multiple-outline"
      iconColor="text-blue-600"
      iconBgColor="bg-blue-500/10"
    >
      <DocumentsManager />
    </AdminPageWrapper>
  );
}
