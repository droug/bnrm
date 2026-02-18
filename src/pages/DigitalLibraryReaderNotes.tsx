import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import { ReaderNotesAdmin } from "@/components/digital-library/admin/ReaderNotesAdmin";

export default function DigitalLibraryReaderNotes() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Notes des lecteurs"
        description="Informations privées transmises par les lecteurs sur les documents"
        icon="mdi:message-text-outline"
        iconColor="text-purple-600"
        iconBgColor="bg-purple-500/10"
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
      title="Notes des lecteurs"
      description="Informations privées transmises par les lecteurs sur les documents de la bibliothèque"
      icon="mdi:message-text-outline"
      iconColor="text-purple-600"
      iconBgColor="bg-purple-500/10"
    >
      <ReaderNotesAdmin />
    </AdminPageWrapper>
  );
}
