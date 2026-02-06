import { useParams, useSearchParams, Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { ReproductionRequestForm } from "@/components/reproduction/ReproductionRequestForm";
import { ReproductionRequestsList } from "@/components/reproduction/ReproductionRequestsList";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function ReproductionPage() {
  const { action } = useParams();
  const [searchParams] = useSearchParams();
  const platform = searchParams.get("platform");
  const { user } = useAuth();
  const { language } = useLanguage();

  // Déterminer si on utilise le layout BN
  const isBNPlatform = platform === "bn";

  if (!user) {
    // Rediriger vers l'auth appropriée selon la plateforme
    return <Navigate to={isBNPlatform ? "/auth-bn" : "/auth"} replace />;
  }

  const content = (
    <main className="container mx-auto px-4 py-8">
      {action === "new" ? (
        <ReproductionRequestForm />
      ) : (
        <ReproductionRequestsList />
      )}
    </main>
  );

  // Utiliser le layout BN si platform=bn
  if (isBNPlatform) {
    return (
      <DigitalLibraryLayout>
        {content}
      </DigitalLibraryLayout>
    );
  }

  // Layout portail par défaut
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {content}
      <Footer />
    </div>
  );
}
