import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuidedToursBackoffice from "@/components/cultural-activities/GuidedToursBackoffice";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitesPage() {
  const { user } = useAuth();
  const { isAuthorized, loading } = useCulturalActivitiesAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <Skeleton className="h-8 w-[250px] mb-4" />
          <Skeleton className="h-[600px]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Visites guidées</h1>
          <p className="text-muted-foreground">
            Gestion des demandes de visites guidées
          </p>
        </div>

        <GuidedToursBackoffice />
      </main>
      <Footer />
    </div>
  );
}
