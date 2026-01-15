import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DigitalLibraryDocumentImporter from "@/components/digital-library/import/DigitalLibraryDocumentImporter";

export default function DigitalLibraryBulkImport() {
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { goBack } = useNavigationHistory();

  if (rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isLibrarian)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => goBack("/admin/digital-library/documents")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <DigitalLibraryDocumentImporter 
          defaultTab="bulk-pdf"
          onSuccess={() => {
            // Optionnel : naviguer vers la liste après succès
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
