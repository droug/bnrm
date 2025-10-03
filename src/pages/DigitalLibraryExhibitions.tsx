import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ExhibitionsManager from "@/components/digital-library/ExhibitionsManager";

export default function DigitalLibraryExhibitions() {
  const { user, profile } = useAuth();

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <ExhibitionsManager />
      </main>
      <Footer />
    </div>
  );
}
