import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ReproductionBackoffice } from "@/components/reproduction/ReproductionBackoffice";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function ReproductionBackofficePage() {
  const { user, profile } = useAuth();

  // Only admins and librarians can access
  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ReproductionBackoffice />
      </main>
      <Footer />
    </div>
  );
}
