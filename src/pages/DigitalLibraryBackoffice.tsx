import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DigitalLibraryBackofficeComponent from "@/components/digital-library/DigitalLibraryBackoffice";

export default function DigitalLibraryBackoffice() {
  const { user, profile } = useAuth();

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
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