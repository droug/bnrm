import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReproductionRequestDetails } from "@/components/reproduction/ReproductionRequestDetails";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ReproductionDetailsPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ReproductionRequestDetails />
      </main>
      <Footer />
    </div>
  );
}
