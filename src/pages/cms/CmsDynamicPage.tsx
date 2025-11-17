import { useParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CmsPageRenderer from "@/components/cms/page-renderer/CmsPageRenderer";

export default function CmsDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  
  // TODO: Detect language from context or URL
  const language = 'fr'; // Default to French

  // Utiliser 'bibliotheque-numerique' pour la route /digital-library
  const pageSlug = slug || (location.pathname === '/digital-library' ? 'bibliotheque-numerique' : null);

  if (!pageSlug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-12">
          <p className="text-center text-muted-foreground">Page non trouvée</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <CmsPageRenderer slug={pageSlug} language={language} />
      </main>
      <Footer />
    </div>
  );
}
