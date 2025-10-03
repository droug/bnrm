import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DocumentsManager from "@/components/digital-library/DocumentsManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DigitalLibraryDocuments() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/digital-library")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <DocumentsManager />
      </main>
      <Footer />
    </div>
  );
}