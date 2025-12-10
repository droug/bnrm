import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExhibitionsManager from "@/components/digital-library/ExhibitionsManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ManuscriptsBackofficeExhibitions() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, isProfessional, loading: rolesLoading } = useSecureRoles();
  const navigate = useNavigate();

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian) || isProfessional) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/manuscripts-backoffice")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <ExhibitionsManager />
      </main>
      <Footer />
    </div>
  );
}
