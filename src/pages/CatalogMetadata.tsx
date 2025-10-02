import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogMetadataManager from "@/components/catalog/CatalogMetadataManager";

export default function CatalogMetadata() {
  const { user, profile } = useAuth();

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'librarian')) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CatalogMetadataManager />
      </main>
      <Footer />
    </div>
  );
}