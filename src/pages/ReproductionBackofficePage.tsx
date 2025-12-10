import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReproductionBackoffice } from "@/components/reproduction/ReproductionBackoffice";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";

export default function ReproductionBackofficePage() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, isProfessional, loading: rolesLoading } = useSecureRoles();

  if (rolesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!user || (!isAdmin && !isLibrarian) || isProfessional) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ReproductionBackoffice />
      </main>
      <Footer />
    </div>
  );
}
