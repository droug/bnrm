import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnalyticsManager from "@/components/digital-library/AnalyticsManager";

export default function DigitalLibraryAnalytics() {
  const { user, profile } = useAuth();

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <AnalyticsManager />
      </main>
      <Footer />
    </div>
  );
}
