import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import ReproductionManager from "@/components/digital-library/ReproductionManager";
import SEOHead from "@/components/seo/SEOHead";

export default function DigitalLibraryReproduction() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <AdminPageWrapper
        title="Demandes de reproduction"
        description="Traitement des demandes"
        icon="mdi:content-copy"
        iconColor="text-cyan-600"
        iconBgColor="bg-cyan-500/10"
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
    <>
      <SEOHead
        title="Demandes de reproduction - Administration BN"
        description="Gestion et traitement des demandes de reproduction de documents"
        noindex={true}
      />
      <AdminPageWrapper
        title="Demandes de reproduction"
        description="Gestion et traitement des demandes de reproduction de documents de la bibliothèque numérique"
        icon="mdi:content-copy"
        iconColor="text-cyan-600"
        iconBgColor="bg-cyan-500/10"
      >
        <ReproductionManager />
      </AdminPageWrapper>
    </>
  );
}
