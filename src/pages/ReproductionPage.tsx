import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReproductionRequestForm } from "@/components/reproduction/ReproductionRequestForm";
import { ReproductionRequestsList } from "@/components/reproduction/ReproductionRequestsList";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Navigate } from "react-router-dom";

export default function ReproductionPage() {
  const { action } = useParams();
  const { user } = useAuth();
  const { language } = useLanguage();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {action === "new" ? (
          <ReproductionRequestForm />
        ) : (
          <ReproductionRequestsList />
        )}
      </main>
      <Footer />
    </div>
  );
}
