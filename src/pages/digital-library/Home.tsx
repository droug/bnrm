// Force cache regeneration: v2 - 2026-01-15
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Image, Music, Calendar, Sparkles, Globe, ExternalLink, Layers, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo/SEOHead";
import SEOImage from "@/components/seo/SEOImage";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Autoplay from "embla-carousel-autoplay";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
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

  // Hero image configured from /admin/content-management (CmsHeroManager)
  const { data: heroSettings } = useQuery({
    queryKey: ['cms-hero-settings-digital-library-home'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_hero_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching hero settings:', error);
        return null;
      }
      return data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
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
                                     className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
                                     onClick={() => handleConsultDocument(item)}
                                   >
                                     <BookOpen className="h-5 w-5 mr-2" />
                                     {t('dl.home.consult')}
                                   </Button>
                                 ) : item.link ? (
                                   <Button 
                                     size="lg" 
                                     className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
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
                                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
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

      {/* Latest Additions */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              {t('dl.home.latestAdditions')}
            </h2>
            <p className="text-muted-foreground mt-1">{t('dl.home.recentlyAdded')}</p>
          </div>
          <Link to="/digital-library/search?sort=recent">
            <Button variant="outline">{t('dl.home.viewAll')}</Button>
          </Link>
        </div>

        {!loading && newItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
                <CardHeader className="flex-1">
                  <div className="aspect-[3/4] rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Badge variant="secondary" className="w-fit mb-2">{item.type}</Badge>
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>{item.author}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                    onClick={() => handleConsultDocument(item)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t('dl.home.consult')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!loading && newItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('dl.home.noRecentDocuments')}</p>
          </div>
        )}
      </section>

      {/* Featured Collections */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-6">{t('dl.home.featuredCollectionsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCollections.map((collection) => (
              <Link key={collection.id} to={collection.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
                      <collection.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{collection.titleKey ? t(collection.titleKey) : collection.title}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-primary">
                      {collection.count}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Themes */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">{t('dl.home.exploreByTheme')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredThemes.map((theme) => (
            <Link key={theme.id} to={theme.href}>
              <Card className="hover:shadow-lg transition-all group">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {theme.emoji}
                  </div>
                  <CardTitle>{theme.titleKey ? t(theme.titleKey) : theme.title}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest News */}
      {newsArticles.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-8 w-8 text-primary" />
                {t('dl.home.latestNews')}
              </h2>
              <Link to="/digital-library/news">
                <Button variant="outline">{t('dl.home.allNews')}</Button>
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
                      <Button variant="outline" className="w-full">{t('dl.home.readMore')}</Button>
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
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
            <CardContent className="py-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
                {statsData.map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-background to-indigo-900/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
              <Layers className="h-4 w-4" />
              Découverte immersive
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Exposition Virtuelle
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explorez l'histoire et le patrimoine du Maroc à travers nos expositions interactives
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Link to="/digital-library/exposition-virtuelle">
              <Card className="group relative overflow-hidden border-2 border-transparent hover:border-purple-500/30 transition-all duration-500 bg-gradient-to-br from-card via-card to-purple-500/5 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Image/Visual */}
                    <div className="relative flex-shrink-0">
                      <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-1 shadow-2xl shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow duration-500">
                        <div className="w-full h-full rounded-xl bg-card flex items-center justify-center overflow-hidden">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />
                            <Layers className="h-24 w-24 text-purple-600 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        </div>
                      </div>
                      <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                        NOUVEAU
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-purple-600 transition-colors">
                        Le Maroc à travers les âges
                      </h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        Une exposition virtuelle interactive présentant l'histoire du Maroc à travers documents rares, 
                        manuscrits anciens et photographies historiques. Découvrez des siècles de patrimoine culturel 
                        dans une expérience immersive unique.
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
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

      {/* Section Réservoirs mondiaux */}
      <section className="py-16 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Qzc1MDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              Ressources internationales
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Réservoirs mondiaux de données
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              Ces réservoirs permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* RFN */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-primary" />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-primary rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                        Réseau Francophone Numérique
                      </CardTitle>
                      <span className="text-xs font-medium text-primary/70 bg-primary/10 px-2 py-1 rounded-full">RFN</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Principal réservoir de l'espace francophone regroupant les collections patrimoniales de bibliothèques nationales. Préserve et diffuse le patrimoine documentaire commun aux 300 millions de francophones.
                  </p>
                  <a 
                    href="https://rfnum.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg font-medium text-primary transition-all duration-300 group/link"
                  >
                    Explorer <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Europeana */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-orange-400/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-orange-500 transition-colors">
                        Europeana
                      </CardTitle>
                      <span className="text-xs font-medium text-orange-600/70 bg-orange-500/10 px-2 py-1 rounded-full">Union Européenne</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Agrégateur central du patrimoine culturel européen. Initiative de l'UE visant à moderniser la numérisation et la réutilisation des données culturelles.
                  </p>
                  <a 
                    href="https://www.europeana.eu/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 hover:bg-orange-500 hover:text-white rounded-lg font-medium text-orange-600 transition-all duration-300 group/link"
                  >
                    Explorer <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* IFLA */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-emerald-400/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-emerald-500 transition-colors">
                        IFLA
                      </CardTitle>
                      <span className="text-xs font-medium text-emerald-600/70 bg-emerald-500/10 px-2 py-1 rounded-full">Normes internationales</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Fédération Internationale des Associations de Bibliothécaires. Définit les normes internationales (IFLA LRM) pour l'interopérabilité entre les grands réservoirs mondiaux.
                  </p>
                  <a 
                    href="https://www.ifla.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white rounded-lg font-medium text-emerald-600 transition-all duration-300 group/link"
                  >
                    Explorer <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* UNESCO Digital Library */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-cyan-400/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-cyan-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-cyan-500 transition-colors">
                        Bibliothèque Numérique UNESCO
                      </CardTitle>
                      <span className="text-xs font-medium text-cyan-600/70 bg-cyan-500/10 px-2 py-1 rounded-full">MONDIACULT</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Réservoir mondial spécialisé dans les politiques culturelles et le patrimoine documentaire mondial, incluant les contributions de la conférence MONDIACULT.
                  </p>
                  <a 
                    href="https://unesdoc.unesco.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500 hover:text-white rounded-lg font-medium text-cyan-600 transition-all duration-300 group/link"
                  >
                    Explorer <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* World Digital Library */}
            <div className="group relative md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-purple-400/30 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1 group-hover:text-purple-500 transition-colors">
                        World Digital Library
                      </CardTitle>
                      <span className="text-xs font-medium text-purple-600/70 bg-purple-500/10 px-2 py-1 rounded-full">Library of Congress</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Projet mené par la Library of Congress et l'UNESCO pour rendre accessibles des documents culturels rares de tous les pays du monde.
                  </p>
                  <a 
                    href="https://www.loc.gov/collections/world-digital-library/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500 hover:text-white rounded-lg font-medium text-purple-600 transition-all duration-300 group/link"
                  >
                    Explorer <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                  </a>
                </CardContent>
              </Card>
            </div>
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
