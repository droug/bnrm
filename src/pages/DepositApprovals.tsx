// Vite cache invalidation v2
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PartiesApprovalManager } from "@/components/legal-deposit/PartiesApprovalManager";

export default function DepositApprovals() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <PartiesApprovalManager />
      </main>
      <Footer />
    </div>
  );
}