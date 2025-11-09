import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CatalogueManager } from "@/components/cbm/CatalogueManager";

export default function CBMCatalogueAdmin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Restrict access to admin only
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/cbm" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cbm-primary/5 to-cbm-secondary/5">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/cbm/admin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'administration CBM
        </Button>
        <CatalogueManager />
      </main>
      <Footer />
    </div>
  );
}
