import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DigitalLibraryBackofficeComponent from "@/components/digital-library/DigitalLibraryBackoffice";

export default function DigitalLibraryBackoffice() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <DigitalLibraryBackofficeComponent />
      </main>
      <Footer />
    </div>
  );
}