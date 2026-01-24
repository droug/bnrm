import { useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useToast } from "@/hooks/use-toast";
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
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/digital-library")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Statistiques - Bibliothèque Numérique</h1>
              <p className="text-muted-foreground">
                Analyse détaillée de l'utilisation de la Bibliothèque Numérique
              </p>
            </div>
          </div>
        </div>

        {/* Main Analytics - Bibliothèque tab only */}
        <PortalAnalyticsKPICard platform="bn" showOnlyTab="digital-library" />
      </div>
    </DigitalLibraryLayout>
  );
}
