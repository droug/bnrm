import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CulturalActivitiesDashboard from "@/components/cultural-activities/CulturalActivitiesDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CulturalActivitiesDashboardPage() {
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
          <Skeleton className="h-4 w-[400px] mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[300px]" />
          </div>
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
          <h1 className="text-3xl font-bold mb-2">
            Tableau de bord - Activités Culturelles
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des demandes et indicateurs de performance
          </p>
        </div>

        <CulturalActivitiesDashboard />
      </main>
      <Footer />
    </div>
  );
}
