import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LegalDepositPendingApprovals } from "@/components/legal-deposit/LegalDepositPendingApprovals";
import { useAccessControl } from "@/hooks/useAccessControl";

export default function LegalDepositApprovals() {
  const { user } = useAuth();
  const { userRole } = useAccessControl();

  // Vérifier si l'utilisateur a un rôle professionnel
  const isProfessional = ['editor', 'printer', 'producer'].includes(userRole);

  if (!user || !isProfessional) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes Approbations</h1>
          <p className="text-muted-foreground">
            Gérez les demandes de dépôt légal nécessitant votre approbation
          </p>
        </div>

        <LegalDepositPendingApprovals />
      </main>
      <Footer />
    </div>
  );
}
