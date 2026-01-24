import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { PortalAnalyticsKPICard } from "@/components/dashboard/PortalAnalyticsKPICard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DigitalLibraryAnalytics() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Statistiques - Bibliothèque Numérique</h1>
          <p className="text-muted-foreground">Analyse détaillée de l'utilisation de la Bibliothèque Numérique</p>
        </div>
        
        <PortalAnalyticsKPICard platform="bn" defaultTab="digital-library" />
      </div>
    </DigitalLibraryLayout>
  );
}
