import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import DigitalLibraryDocumentImporter from "@/components/digital-library/import/DigitalLibraryDocumentImporter";

export default function DigitalLibraryBulkImport() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();

  if (rolesLoading) {
    return (
      <AdminPageWrapper
        title="Import & Catalogage"
        description="Import Excel/XML/OAI-PMH"
        icon="mdi:upload-outline"
        iconColor="text-amber-600"
        backPath="/admin/digital-library/documents"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  return (
    <AdminPageWrapper
      title="Import & Catalogage"
      description="Import en masse de documents via Excel, XML ou protocole OAI-PMH"
      icon="mdi:upload-outline"
      iconColor="text-amber-600"
      backPath="/admin/digital-library/documents"
    >
      <DigitalLibraryDocumentImporter 
        defaultTab="bulk-pdf"
        onSuccess={() => {
          // Optionnel : naviguer vers la liste après succès
        }}
      />
    </AdminPageWrapper>
  );
}
