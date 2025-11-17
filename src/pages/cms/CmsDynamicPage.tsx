import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CmsPageRenderer from "@/components/cms/page-renderer/CmsPageRenderer";

export default function CmsDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // TODO: Detect language from context or URL
  const language = 'fr'; // Default to French

  if (!slug) {
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
        <CmsPageRenderer slug={slug} language={language} />
      </main>
      <Footer />
    </div>
  );
}
