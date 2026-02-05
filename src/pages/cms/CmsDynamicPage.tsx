import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import DOMPurify from "dompurify";

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content_body: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  status: string;
}

export default function CmsDynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useTranslation();
  const [page, setPage] = useState<ContentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError("Page non trouvée");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("content")
          .select("id, slug, title, content_body, excerpt, featured_image_url, status")
          .eq("slug", slug)
          .single();

        if (fetchError) {
          console.error("Error fetching page:", fetchError);
          setError("Page non trouvée");
        } else {
          setPage(data);
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {t('portal.common.error')}
          </h1>
          <p className="text-muted-foreground">
            {t('portal.error.404.desc')}
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{page.title} | BNRM</title>
        {page.excerpt && <meta name="description" content={page.excerpt} />}
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        {/* Hero avec image */}
        {page.featured_image_url && (
          <div className="relative h-64 md:h-80 mb-8 rounded-lg overflow-hidden">
            <img 
              src={page.featured_image_url} 
              alt={page.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <h1 className="absolute bottom-6 left-6 right-6 text-3xl md:text-4xl font-bold text-white">
              {page.title}
            </h1>
          </div>
        )}
        
        {/* Titre sans image */}
        {!page.featured_image_url && (
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {page.title}
          </h1>
        )}
        
        {/* Extrait */}
        {page.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 border-l-4 border-primary pl-4">
            {page.excerpt}
          </p>
        )}
        
        {/* Contenu */}
        {page.content_body ? (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(page.content_body) 
            }}
          />
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              {t('portal.common.loading')}
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
