import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CBMStatsDashboard } from "@/components/cbm/CBMStatsDashboard";

export default function CBMReports() {
  const { user } = useAuth();
  const { isAdmin, loading } = useSecureRoles();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
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
        <CBMStatsDashboard />
      </main>
      <Footer />
    </div>
  );
}
