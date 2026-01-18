import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { HeroSection } from "./sections/HeroSection";
import { RichTextSection } from "./sections/RichTextSection";
import { GridSection } from "./sections/GridSection";
import { CardListSection } from "./sections/CardListSection";
import { BannerSection } from "./sections/BannerSection";
import { FaqSection } from "./sections/FaqSection";
import { EventListSection } from "./sections/EventListSection";
import { ImageSection } from "./sections/ImageSection";
import { VideoSection } from "./sections/VideoSection";
import { CalloutSection } from "./sections/CalloutSection";
import { StatBlocksSection } from "./sections/StatBlocksSection";
import { IbnBattoutaStatsSection } from "./sections/IbnBattoutaStatsSection";
import { MediathequeSection } from "./sections/MediathequeSection";
import { ElectronicResourcesSection } from "./sections/ElectronicResourcesSection";

interface CmsPageRendererProps {
  slug: string;
  language?: 'fr' | 'ar';
}

export default function CmsPageRenderer({ slug, language = 'fr' }: CmsPageRendererProps) {
  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        
        // Utiliser l'API publique cms-api
        const SUPABASE_URL = "https://safeppmznupzqkqmzjzt.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhZmVwcG16bnVwenFrcW16anp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzMxNDYsImV4cCI6MjA3Mzk0OTE0Nn0._lNseTnhm88eUPMAMxeTZ-qn2vWGPm73M66lppaoSWE";
        
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/cms-api/pages/${slug}?language=${language}`,
          {
            headers: {
              'apikey': SUPABASE_KEY
            }
          }
        );

        if (!response.ok) {
          throw new Error('Page non trouvée');
        }

        const data = await response.json();
        setPage(data);
        setSections(data.sections || []);

      } catch (err: any) {
        console.error('Error fetching CMS page:', err);
        setError(err.message || 'Erreur lors du chargement de la page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const renderSection = (section: any) => {
    const props = {
      section,
      language
    };

    switch (section.type || section.section_type) {
      case 'hero':
        return <HeroSection {...props} />;
      case 'richtext':
        return <RichTextSection {...props} />;
      case 'grid':
        return <GridSection {...props} />;
      case 'cardList':
        return <CardListSection {...props} />;
      case 'banner':
        return <BannerSection {...props} />;
      case 'faq':
        return <FaqSection {...props} />;
      case 'eventList':
        return <EventListSection {...props} />;
      case 'image':
        return <ImageSection {...props} />;
      case 'video':
        return <VideoSection {...props} />;
      case 'callout':
        return <CalloutSection {...props} />;
      case 'statBlocks':
        return <StatBlocksSection {...props} />;
      case 'ibnBattoutaStats':
        return <IbnBattoutaStatsSection {...props} />;
      case 'mediatheque':
        return <MediathequeSection {...props} />;
      case 'electronicResources':
        return <ElectronicResourcesSection {...props} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Erreur</h1>
        <p className="text-muted-foreground">{error || 'Page introuvable'}</p>
      </div>
    );
  }

  const title = page.title;
  const seoTitle = page.seo?.title;
  const seoDescription = page.seo?.description;

  return (
    <>
      <Helmet>
        <title>{seoTitle || title}</title>
        {seoDescription && <meta name="description" content={seoDescription} />}
        <meta property="og:title" content={seoTitle || title} />
        {seoDescription && <meta property="og:description" content={seoDescription} />}
      </Helmet>

      <div className="cms-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {sections.map((section, index) => (
          <div key={index}>{renderSection(section)}</div>
        ))}
      </div>
    </>
  );
}
