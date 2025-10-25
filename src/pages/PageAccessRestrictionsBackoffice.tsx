import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageAccessRestrictionsManager } from "@/components/digital-library/PageAccessRestrictionsManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PageAccessRestrictionsBackoffice() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Bloquer l'accès aux comptes professionnels
  const professionalRoles = ['editor', 'printer', 'producer'];
  if (!user || !profile || !['admin', 'librarian'].includes(profile.role) || professionalRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library-backoffice")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Button>
        <PageAccessRestrictionsManager />
      </main>
      <Footer />
    </div>
  );
}