import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReproductionBackoffice } from "@/components/reproduction/ReproductionBackoffice";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ReproductionBackofficePage() {
  const { user, profile } = useAuth();

  // Bloquer l'accès aux comptes professionnels
  const professionalRoles = ['editor', 'printer', 'producer'];
  if (!user || !profile || !['admin', 'librarian'].includes(profile.role) || professionalRoles.includes(profile.role)) {
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
