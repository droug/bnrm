import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { WatermarkContainer } from "@/components/ui/watermark";
import { AdminHeader } from "@/components/AdminHeader";
import { CommitteeManager } from "@/components/legal-deposit/CommitteeManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Navigate } from "react-router-dom";

const CommitteeDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();

  if (rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  return (
    <WatermarkContainer>
      <div className="min-h-screen bg-background">
        <AdminHeader 
          title="Comité de Validation - Dépôt Légal" 
          subtitle="Gestion du comité et des évaluations"
        />

        <main className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Tableau de bord</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/legal-deposit">Dépôt Légal</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Comité de Validation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <CommitteeManager />

          <div className="mt-8 flex justify-start">
            <Button 
              variant="outline"
              onClick={() => navigate('/legal-deposit')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dépôt légal
            </Button>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
};

export default CommitteeDashboard;
