// Force cache regeneration: v4 - 2026-01-18
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Image, Music, Calendar, Sparkles, Globe, ExternalLink, Layers, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import SEOImage from "@/components/seo/SEOImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { LatestAdditionsSection } from "@/components/digital-library/LatestAdditionsSection";
import { IbnBattoutaStatsSection } from "@/components/digital-library/IbnBattoutaStatsSection";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { useCmsStyles } from "@/hooks/useCmsStyles";
import document1 from "@/assets/digital-library/document-1.jpg";
import document2 from "@/assets/digital-library/document-2.jpg";
import document3 from "@/assets/digital-library/document-3.jpg";
import document4 from "@/assets/digital-library/document-4.jpg";
import document5 from "@/assets/digital-library/document-5.jpg";
import document6 from "@/assets/digital-library/document-6.jpg";
import archivesPhotoMaroc from "@/assets/digital-library/archives-photo-maroc.jpg";
import cartesAnciennes from "@/assets/digital-library/cartes-anciennes.jpg";
import logicielPatrimoine from "@/assets/digital-library/logiciel-patrimoine.jpg";
import manuscritsAndalous from "@/assets/digital-library/manuscrits-andalous.jpg";
import documentsAdministratifs from "@/assets/digital-library/documents-administratifs.jpg";
import libraryBanner from "@/assets/digital-library/library-banner.jpg";

export default function DigitalLibraryHome() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t, language } = useLanguage();
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [repoCarouselIndex, setRepoCarouselIndex] = useState(0);

  // Fetch CMS styles for BN platform
  const { data: cmsStyles } = useCmsStyles('bn');

  // Hero image configured from /admin/content-management-BN (CmsHeroManagerBN)
  // Fetches settings for the BN (Bibliothèque Numérique) platform specifically
  const { data: heroSettings } = useQuery({
    queryKey: ["cms-hero-settings-bn"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cms_hero_settings")
        .select("*")
        .eq("platform", "bn")
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching hero settings:", error);
        return null;
      }

      return data ?? null;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const heroImageUrl = heroSettings?.hero_image_url?.trim() ? heroSettings.hero_image_url : libraryBanner;
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("user_id", session.user.id)
          .single();
        
        if (data) {
          setUserProfile({
            firstName: data.first_name,
            lastName: data.last_name,
            email: session.user.email,
          });
        }
      }
    };
    loadUserProfile();
  }, [session]);

  const [newItems, setNewItems] = useState<any[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<any[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [featuredThemes, setFeaturedThemes] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Load featured works from CMS for the hero carousel
  useEffect(() => {
    const loadFeaturedWorks = async () => {
      setLoadingFeatured(true);
      try {
        // Load featured works from digital_library_featured_works
        const { data: works, error } = await supabase
          .from('digital_library_featured_works')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        
        if (works && works.length > 0) {
          // For each work, get document details if linked
          const formattedWorks = await Promise.all(works.map(async (work: any) => {
            let docData = null;
            
            if (work.document_id) {
              const { data } = await supabase
                .from('digital_library_documents')
                .select('id, title, author, cover_image_url, document_type, publication_year, is_manuscript')
                .eq('id', work.document_id)
                .single();
              docData = data;
            }
            
            return {
              id: work.document_id || work.id,
              workId: work.id,
              title: docData?.title || work.custom_title || 'Sans titre',
              title_ar: work.custom_title_ar,
              author: docData?.author || work.custom_author || t('dl.home.unknownAuthor'),
              type: work.custom_category || (docData?.is_manuscript ? t('dl.docTypes.manuscript') : t('dl.docTypes.document')),
              date: work.custom_date || (docData?.publication_year ? String(docData.publication_year) : ''),
              thumbnail: docData?.cover_image_url || work.custom_image_url,
              description: work.custom_description,
              link: work.custom_link,
              isManuscript: docData?.is_manuscript || false,
              hasDocument: !!work.document_id,
            };
          }));
          
          setFeaturedWorks(formattedWorks);
        }
      } catch (err) {
        console.error('Error loading featured works:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    
    loadFeaturedWorks();
  }, [t]);

  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoading(true);
      try {
        // Charger depuis digital_library_documents
        const { data, error } = await supabase
          .from('digital_library_documents')
          .select('id, title, author, publication_year, document_type, cover_image_url, created_at, is_manuscript')
          .eq('publication_status', 'published')
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(6);

        if (data && !error) {
          // Images réelles pour les exemples
          const exampleImages = [document1, document2, document3, document4, document5, document6];
          
          // Mapping spécifique pour certains titres
          const titleImageMap: { [key: string]: string } = {
            "Archives Photographiques du Maroc Colonial": archivesPhotoMaroc,
            "Collection de Cartes Anciennes": cartesAnciennes,
            "Logiciel Patrimoine": logicielPatrimoine,
            "Manuscrits Andalous": manuscritsAndalous,
            "Documents Administratifs Historiques": documentsAdministratifs,
          };

          const formattedItems = data.map((item: any, index: number) => {
            // Utiliser cover_image_url si elle existe, sinon l'image spécifique par titre, sinon l'image par défaut
            const thumbnail = item.cover_image_url || titleImageMap[item.title] || exampleImages[index % exampleImages.length];
            
            return {
              id: item.id,
              title: item.title,
              author: item.author || t('dl.home.unknownAuthor'),
              type: item.is_manuscript ? t('dl.docTypes.manuscript') : 
                    item.document_type === 'book' ? t('dl.docTypes.book') : 
                    item.document_type === 'article' ? t('dl.docTypes.article') : t('dl.docTypes.document'),
              date: item.created_at,
              isAvailable: true,
              cote: item.document_type?.toUpperCase() || 'DOC',
              thumbnail: thumbnail,
              isManuscript: item.is_manuscript,
            };
          });
          
          console.log('Loaded digital library documents:', formattedItems);
          setNewItems(formattedItems);
        } else if (error) {
          console.error('Error loading documents:', error);
        }
      } catch (err) {
        console.error('Exception loading documents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDocuments();
  }, [t]);

  const handleReservationClick = (item: any) => {
    setSelectedDocument(item);
    setShowReservationDialog(true);
  };

  const handleConsultDocument = (item: any) => {
    const isManuscript = item.type === 'Manuscrit' || item.file_type === 'manuscript';
    
    if (isManuscript) {
      navigate(`/manuscript-reader/${item.id}`);
    } else {
      navigate(`/digital-library/book-reader/${item.id}`);
    }
  };

  useEffect(() => {
    const loadHomeContent = async () => {
      // Charger les collections depuis le CMS (tag: home-collection)
      const { data: collections } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'page')
        .eq('status', 'published')
        .eq('is_featured', true)
        .contains('tags', ['home-collection'])
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (collections && collections.length > 0) {
        setFeaturedCollections(collections.map(col => ({
          id: col.id,
          title: col.title,
          icon: BookOpen,
          count: col.meta_description || "0",
          href: col.slug || '#',
          image: col.featured_image_url || manuscritsAndalous,
          description: col.excerpt
        })));
      } else {
        // Valeurs par défaut
        setFeaturedCollections([
          {
            id: "books",
            titleKey: "dl.collections.books",
            icon: BookOpen,
            count: "45,670",
            href: "/digital-library/collections/books",
            image: manuscritsAndalous
          },
          {
            id: "periodicals",
            titleKey: "dl.collections.periodicals",
            icon: FileText,
            count: "8,320",
            href: "/digital-library/collections/periodicals",
            image: manuscritsAndalous
          },
          {
            id: "photos",
            titleKey: "dl.collectionsPage.photos",
            icon: Image,
            count: "15,890",
            href: "/digital-library/collections/photos",
            image: manuscritsAndalous
          },
          {
            id: "audiovisual",
            titleKey: "dl.collections.audiovisual",
            icon: Music,
            count: "2,890",
            href: "/digital-library/collections/audiovisual",
            image: manuscritsAndalous
          },
        ]);
      }

      // Charger les thèmes (tag: home-theme)
      const { data: themes } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'page')
        .eq('status', 'published')
        .eq('is_featured', true)
        .contains('tags', ['home-theme'])
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (themes && themes.length > 0) {
        setFeaturedThemes(themes.map(theme => ({
          id: theme.id,
          title: theme.title,
          emoji: theme.meta_description || '📚',
          href: theme.slug || '#'
        })));
      } else {
        // Valeurs par défaut
        setFeaturedThemes([
          { id: "history", titleKey: "dl.themes.history", emoji: "🏛️", href: "/digital-library/themes/history" },
          { id: "arts", titleKey: "dl.themes.arts", emoji: "🎨", href: "/digital-library/themes/arts" },
          { id: "literature", titleKey: "dl.themes.literature", emoji: "✍️", href: "/digital-library/themes/literature" },
        ]);
      }

      // Charger les actualités
      const { data: news } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'news')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(2);
      
      if (news) {
        setNewsArticles(news);
      }

      // Charger les statistiques (tag: home-stats)
      const { data: stats } = await supabase
        .from('content')
        .select('*')
        .eq('content_type', 'page')
        .eq('status', 'published')
        .contains('tags', ['home-stats'])
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (stats && stats.length > 0) {
        setStatsData(stats.map(stat => ({
          label: stat.title,
          value: stat.meta_description || '0'
        })));
      } else {
        // Valeurs par défaut
        setStatsData([
          { labelKey: "dl.home.digitizedManuscripts", value: "12,450" },
          { labelKey: "dl.home.historicalDocuments", value: "5,230" },
          { labelKey: "dl.home.imagesAndMaps", value: "8,760" },
        ]);
      }
    };

    loadHomeContent();
  }, []);

  return (
    <DigitalLibraryLayout>
      <SEOHead
        title="Bibliothèque Numérique"
        description="Accédez à plus de 100,000 documents numérisés du patrimoine marocain : livres, manuscrits, revues, photographies et archives audiovisuelles."
        keywords={["bibliothèque numérique", "documents numérisés", "patrimoine marocain", "livres électroniques", "archives numériques", "collections BNRM"]}
      />
      
      {/* Hero Section with Background Image */}
      <section 
        className="relative py-16 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in drop-shadow-lg">
              {t('dl.home.welcome')}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in drop-shadow-md">
              {t('dl.home.accessDocuments')}
            </p>
          </div>

          {/* Hero Carousel - Uses Featured Works from CMS */}
          {!loadingFeatured && featuredWorks.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full"
              >
                <CarouselContent>
                  {featuredWorks.map((item) => (
                     <CarouselItem key={item.workId || item.id} className="animate-fade-in">
                       <div className="p-1">
                         <Card className="border-2 hover:shadow-2xl transition-all duration-700 bg-background/10 backdrop-blur-sm border-primary-foreground/30 hover:bg-background/20 hover:scale-[1.02]">
                           <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8 text-white">
                             <div className="flex-1">
                               <Badge className="mb-3">{item.type}</Badge>
                               <h3 className="text-2xl font-bold mb-2 text-white">
                                 {language === 'ar' && item.title_ar ? item.title_ar : item.title}
                               </h3>
                               <p className="text-white/80 mb-2">{item.author}</p>
                               {item.description && (
                                 <p className="text-sm text-white/70 mb-3 line-clamp-2">{item.description}</p>
                               )}
                               {item.date && (
                                 <p className="text-sm text-white/60 mb-4">{item.date}</p>
                               )}
                               <div className="flex gap-2 mt-6">
                                  {item.hasDocument ? (
                                    <Button 
                                      size="lg" 
                                      className="bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark hover:from-gold-bn-primary-dark hover:to-gold-bn-deep text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
                                      onClick={() => handleConsultDocument(item)}
                                    >
                                      <BookOpen className="h-5 w-5 mr-2" />
                                      {t('dl.home.consult')}
                                   </Button>
                                  ) : item.link ? (
                                    <Button 
                                      size="lg" 
                                      className="bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark hover:from-gold-bn-primary-dark hover:to-gold-bn-deep text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
                                      onClick={() => window.open(item.link, '_blank')}
                                    >
                                      <ExternalLink className="h-5 w-5 mr-2" />
                                      {t('dl.home.discover')}
                                   </Button>
                                 ) : null}
                               </div>
                            </div>
                            {item.thumbnail && (
                              <div className="w-full md:w-48 h-64 rounded-lg overflow-hidden hover-scale shadow-xl">
                                <img 
                                  src={item.thumbnail} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          )}
          {/* Fallback to recent documents if no featured works */}
          {!loadingFeatured && featuredWorks.length === 0 && !loading && newItems.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full"
              >
                <CarouselContent>
                  {newItems.map((item) => (
                     <CarouselItem key={item.id} className="animate-fade-in">
                       <div className="p-1">
                         <Card className="border-2 hover:shadow-2xl transition-all duration-700 bg-background/10 backdrop-blur-sm border-primary-foreground/30 hover:bg-background/20 hover:scale-[1.02]">
                           <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8 text-white">
                             <div className="flex-1">
                               <Badge className="mb-3">{item.type}</Badge>
                               <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                               <p className="text-white/80 mb-4">{item.author}</p>
                                <p className="text-sm text-white/70 mb-4">{t('dl.home.addedOn')} {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'en' ? 'en-US' : 'fr-FR')}</p>
                                    <div className="flex gap-2 mt-6">
                                     <Button 
                                       size="lg" 
                                       className="bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark hover:from-gold-bn-primary-dark hover:to-gold-bn-deep text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
                                       onClick={() => handleConsultDocument(item)}
                                     >
                                       <BookOpen className="h-5 w-5 mr-2" />
                                       {t('dl.home.consult')}
                                    </Button>
                                 </div>
                            </div>
                            <div className="w-full md:w-48 h-64 rounded-lg overflow-hidden hover-scale shadow-xl">
                              <img 
                                src={item.thumbnail} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          )}
          {(loadingFeatured || loading) && (
            <div className="max-w-5xl mx-auto text-center py-12">
              <p className="text-white/90 drop-shadow-md">{t('dl.home.loadingDocuments')}</p>
            </div>
          )}
          {!loadingFeatured && featuredWorks.length === 0 && !loading && newItems.length === 0 && (
            <div className="max-w-5xl mx-auto text-center py-12">
              <p className="text-white/90 drop-shadow-md">{t('dl.home.noDocumentsAvailable')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Additions - Reference Design */}
      <LatestAdditionsSection 
        items={newItems}
        loading={loading}
        onConsultDocument={handleConsultDocument}
      />

      {/* Ibn Battouta en chiffres - Stats Section */}
      <IbnBattoutaStatsSection />

      {/* Latest News */}
      {newsArticles.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3 text-bn-blue-primary font-heading flex items-center gap-2">
                <Calendar className="h-8 w-8 text-gold-bn-primary" />
                {t('dl.home.latestNews')}
              </h2>
              <Link to="/digital-library/news">
                <Button variant="outline" className="border-gold-bn-primary text-bn-blue-primary hover:bg-gold-bn-surface">{t('dl.home.allNews')}</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsArticles.map((article) => (
                <Card key={article.id}>
                  {article.featured_image_url && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img 
                        src={article.featured_image_url}
                        alt={article.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>{article.published_at ? format(new Date(article.published_at), 'dd MMMM yyyy') : ''}</span>
                    </div>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/digital-library/news/${article.id}`}>
                      <Button variant="outline" className="w-full border-gold-bn-primary text-bn-blue-primary hover:bg-gold-bn-surface">{t('dl.home.readMore')}</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      {statsData.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-br from-bn-blue-primary/10 to-gold-bn-primary/10 border-2 border-gold-bn-primary/30">
            <CardContent className="py-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
                {statsData.map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold text-gold-bn-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.labelKey ? t(stat.labelKey) : stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Section Exposition Virtuelle */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bn-blue-primary/10 via-background to-gold-bn-primary/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-bn-blue-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-bn-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            {/* Icon badge */}
            <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary rounded-lg mb-6">
              <Layers className="h-6 w-6 text-gold-bn-primary" />
            </div>
            
            <h2 className="heading-3 text-bn-blue-primary font-heading">
              Exposition Virtuelle
            </h2>
            <p className="font-body text-regular text-muted-foreground max-w-2xl mx-auto mt-4">
              Explorez l'histoire et le patrimoine du Maroc à travers nos expositions interactives
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Link to="/digital-library/exposition-virtuelle">
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-gold-bn-primary/30 transition-all duration-500 bg-gradient-to-br from-card via-card to-bn-blue-primary/5 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-bn-blue-primary/0 via-bn-blue-primary/5 to-gold-bn-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Image/Visual */}
                    <div className="relative flex-shrink-0">
                      <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-bn-blue-primary to-bn-blue-deep p-1 shadow-2xl shadow-bn-blue-primary/20 group-hover:shadow-bn-blue-primary/40 transition-shadow duration-500">
                        <div className="w-full h-full rounded-xl bg-card flex items-center justify-center overflow-hidden">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-bn-blue-primary/20 to-gold-bn-primary/20 rounded-full blur-xl animate-pulse" />
                            <Layers className="h-24 w-24 text-bn-blue-primary relative z-10 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark text-white text-xs font-bold rounded-full shadow-lg">
                        NOUVEAU
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-bn-blue-primary transition-colors">
                        Le Maroc à travers les âges
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Une exposition virtuelle interactive présentant l'histoire du Maroc à travers documents rares, 
                        manuscrits anciens et photographies historiques. Découvrez des siècles de patrimoine culturel 
                        dans une expérience immersive unique.
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <Button className="bg-gradient-to-r from-gold-bn-primary to-gold-bn-primary-dark hover:from-gold-bn-primary-dark hover:to-gold-bn-deep text-white shadow-lg shadow-gold-bn-primary/25 group-hover:shadow-gold-bn-primary/40 transition-all duration-300">
                          <Eye className="h-4 w-4 mr-2" />
                          Visiter l'exposition
                        </Button>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            50+ documents
                          </span>
                          <span className="flex items-center gap-1">
                            <Image className="h-4 w-4" />
                            100+ images
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Ressources électroniques - Style "Page d'accueil BN" */}
      <section className="py-20 bg-gradient-to-b from-muted to-background relative overflow-hidden">
        {/* Décorations de fond (très léger) */}
        <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-tr from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-tl from-gold-bn-primary/30 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-14">
            {/* Icône dorée (grille + plus) */}
            <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-bn-primary rounded-lg mb-6">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold-bn-primary" aria-hidden="true">
                <rect x="5" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                {/* petit + en bas à droite */}
                <path d="M16.5 14.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h2 className="heading-3 text-bn-blue-primary font-heading">
              Ressources électroniques
            </h2>
            <p className="font-body text-regular text-muted-foreground max-w-2xl mx-auto mt-4">
              Ces ressources permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale
            </p>
          </div>

          {/* Carrousel */}
          <div className="relative px-16">
            {/* Flèche gauche */}
            <button
              onClick={() => setRepoCarouselIndex(prev => Math.max(0, prev - 1))}
              disabled={repoCarouselIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.5} />
            </button>

            {/* Slides */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${repoCarouselIndex * 33.333}%)` }}
              >
                {/* BRILL */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="flex items-center justify-center gap-4">
                        {/* Icône Brill (bloc bleu + pictogramme blanc) */}
                        <div className="w-14 h-14 bg-bn-blue-primary rounded-md flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" aria-hidden="true">
                            <path d="M9 18V7h5.2c2.2 0 3.8 1.4 3.8 3.2 0 1.6-1 2.8-2.6 3.1l2.4 4.5h-2.4L13.3 14H11v4H9z" fill="white" />
                          </svg>
                        </div>
                        <span className="font-heading text-[30px] tracking-[0.14em] text-bn-blue-primary">BRILL</span>
                      </div>
                      <a
                        href="https://brill.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold"
                      >
                        brill.com
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        Brill est une maison d'édition académique néerlandaise fondée en 1683 à Leiden. Elle publie des livres, des revues scientifiques et des ouvrages de référence dans les domaines des sciences humaines, du droit international, des études islamiques et orientales, de la linguistique et de l'histoire.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a
                          href="https://brill.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors"
                        >
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* EBSCO */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="font-heading text-[42px] font-semibold text-bn-blue-primary tracking-wide">EBSCO</div>
                      <a
                        href="https://www.ebsco.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold"
                      >
                        ebsco.com
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        ebsco.com est le site officiel de EBSCO Information Services, un fournisseur américain de bases de données, revues et livres numériques, ainsi que d'outils de recherche utilisés par les bibliothèques, universités, écoles et institutions à travers le monde.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a
                          href="https://www.ebsco.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors"
                        >
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CAIRN */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="flex items-center justify-center gap-3">
                        {/* Icône losanges */}
                        <svg viewBox="0 0 32 32" className="w-10 h-10 text-bn-blue-primary" fill="currentColor" aria-hidden="true">
                          <path d="M8 6l6 6-6 6-6-6 6-6zm12 0l6 6-6 6-6-6 6-6zm-6 12l6 6-6 6-6-6 6-6z" />
                        </svg>
                        <div className="text-left">
                          <div className="leading-none">
                            <span className="font-heading text-[26px] tracking-[0.18em] text-bn-blue-primary">CAIRN</span>
                            <span className="font-heading text-[26px] tracking-[0.18em] text-muted-foreground/60">.INF</span>
                          </div>
                          <div className="mt-1 text-xs tracking-[0.14em] text-bn-blue-primary font-semibold">
                            SCIENCES HUMAINES &amp; SOCIALES
                          </div>
                        </div>
                      </div>
                      <a
                        href="https://shs.cairn.info/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold"
                      >
                        Cairn.info
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        Cairn.info, plateforme de référence pour les publications scientifiques francophones, vise à favoriser la découverte d'une recherche de qualité tout en cultivant l'indépendance et la diversité des acteurs de l'écosystème du savoir.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a
                          href="https://shs.cairn.info/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors"
                        >
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* RFN */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="font-heading text-[42px] font-semibold text-bn-blue-primary">RFN</div>
                      <a href="https://rfnum.org" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold">
                        rfnum.org
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        Réseau Francophone Numérique regroupant les collections patrimoniales de bibliothèques nationales francophones pour préserver le patrimoine documentaire commun.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a href="https://rfnum.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors">
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Europeana */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="font-heading text-[42px] font-semibold text-bn-blue-primary">Europeana</div>
                      <a href="https://www.europeana.eu" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold">
                        europeana.eu
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        Agrégateur central du patrimoine culturel européen. Initiative de l'UE visant à moderniser la numérisation et la réutilisation des données culturelles.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a href="https://www.europeana.eu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors">
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* IFLA */}
                <div className="flex-shrink-0 w-full md:w-1/3 px-4">
                  <Card className="bg-card border-0 rounded-xl h-full shadow-[0_6px_24px_hsl(0_0%_0%_/0.12)]">
                    <CardHeader className="text-center pt-10 pb-4">
                      <div className="font-heading text-[42px] font-semibold text-bn-blue-primary">IFLA</div>
                      <a href="https://www.ifla.org" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-bn-blue-primary underline underline-offset-4 font-semibold">
                        ifla.org
                      </a>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 flex flex-col">
                      <p className="text-muted-foreground text-sm leading-relaxed text-justify">
                        Fédération Internationale des Associations de Bibliothécaires. Définit les normes internationales pour l'interopérabilité entre les grands réservoirs mondiaux.
                      </p>
                      <div className="flex justify-end mt-6">
                        <a href="https://www.ifla.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-gold-bn-surface text-bn-blue-primary text-sm font-medium underline underline-offset-4 hover:bg-gold-bn-primary/20 transition-colors">
                          Explorer <ChevronRight className="h-4 w-4" strokeWidth={2} />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Flèche droite */}
            <button
              onClick={() => setRepoCarouselIndex(prev => Math.min(3, prev + 1))}
              disabled={repoCarouselIndex >= 3}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Suivant"
            >
              <ChevronRight className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-14">
            {[0, 1, 2, 3].map((index) => (
              <button
                key={index}
                onClick={() => setRepoCarouselIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  repoCarouselIndex === index ? 'bg-gold-bn-primary' : 'bg-muted-foreground/25 hover:bg-muted-foreground/40'
                }`}
                aria-label={`Aller à la page ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reservation Dialog */}
      {selectedDocument && userProfile && (
        <ReservationRequestDialog
          isOpen={showReservationDialog}
          onClose={() => {
            setShowReservationDialog(false);
            setSelectedDocument(null);
          }}
          documentId={selectedDocument.id}
          documentTitle={selectedDocument.title}
          documentCote={selectedDocument.cote}
          userProfile={userProfile}
        />
      )}
    </DigitalLibraryLayout>
  );
}
