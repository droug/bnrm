import { useState, useEffect, useRef } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Image, Music, Calendar, Sparkles, Globe, ExternalLink } from "lucide-react";
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
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
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
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [featuredThemes, setFeaturedThemes] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
              author: item.author || 'Auteur inconnu',
              type: item.is_manuscript ? 'Manuscrit' : 
                    item.document_type === 'book' ? 'Livre' : 
                    item.document_type === 'article' ? 'Article' : 'Document',
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
  }, []);

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
            title: "Livres numériques",
            icon: BookOpen,
            count: "45,670",
            href: "/digital-library/collections/books",
            image: manuscritsAndalous
          },
          {
            id: "periodicals",
            title: "Revues et périodiques",
            icon: FileText,
            count: "8,320",
            href: "/digital-library/collections/periodicals",
            image: manuscritsAndalous
          },
          {
            id: "photos",
            title: "Photographies",
            icon: Image,
            count: "15,890",
            href: "/digital-library/collections/photos",
            image: manuscritsAndalous
          },
          {
            id: "audiovisual",
            title: "Archives A/V",
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
          { id: "history", title: "Histoire & Patrimoine", emoji: "🏛️", href: "/digital-library/themes/history" },
          { id: "arts", title: "Arts & Culture", emoji: "🎨", href: "/digital-library/themes/arts" },
          { id: "literature", title: "Littérature & Poésie", emoji: "✍️", href: "/digital-library/themes/literature" },
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
          { label: "Manuscrits numérisés", value: "12,450" },
          { label: "Documents historiques", value: "5,230" },
          { label: "Images et cartes", value: "8,760" },
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
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${libraryBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in drop-shadow-lg">
              Bienvenue à la Bibliothèque Numérique
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto animate-fade-in drop-shadow-md">
              Accédez à plus de 100,000 documents numérisés du patrimoine marocain
            </p>
          </div>

          {/* Carousel */}
          {!loading && newItems.length > 0 && (
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
                               <p className="text-sm text-white/70 mb-4">Ajouté le {new Date(item.date).toLocaleDateString('fr-FR')}</p>
                                 <div className="flex gap-2 mt-6">
                                   <Button 
                                     size="lg" 
                                     className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[160px]" 
                                     onClick={() => handleConsultDocument(item)}
                                   >
                                     <BookOpen className="h-5 w-5 mr-2" />
                                     Consulter
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
          {loading && (
            <div className="max-w-5xl mx-auto text-center py-12">
              <p className="text-white/90 drop-shadow-md">Chargement des documents...</p>
            </div>
          )}
          {!loading && newItems.length === 0 && (
            <div className="max-w-5xl mx-auto text-center py-12">
              <p className="text-white/90 drop-shadow-md">Aucun document disponible pour le moment</p>
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
              Derniers ajouts
            </h2>
            <p className="text-muted-foreground mt-1">Documents récemment ajoutés à nos collections</p>
          </div>
          <Link to="/digital-library/search?sort=recent">
            <Button variant="outline">Voir tout</Button>
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
                    Consulter
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {!loading && newItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun document récent disponible</p>
          </div>
        )}
      </section>

      {/* Featured Collections */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-6">Collections phares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCollections.map((collection) => (
              <Link key={collection.id} to={collection.href}>
                <Card className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
                      <collection.icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{collection.title}</CardTitle>
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
        <h2 className="text-3xl font-bold text-foreground mb-6">Explorer par thème</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredThemes.map((theme) => (
            <Link key={theme.id} to={theme.href}>
              <Card className="hover:shadow-lg transition-all group">
                <CardHeader className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                    {theme.emoji}
                  </div>
                  <CardTitle>{theme.title}</CardTitle>
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
                Actualités récentes
              </h2>
              <Link to="/digital-library/news">
                <Button variant="outline">Toutes les actualités</Button>
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
                      <Button variant="outline" className="w-full">Lire la suite</Button>
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
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* World Data Repositories Section */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3 mb-3">
              <Globe className="h-8 w-8 text-primary" />
              Réservoirs mondiaux de données et de métadonnées
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Ces réservoirs permettent la centralisation et le partage du patrimoine documentaire et culturel à l'échelle internationale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* RFN */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Réseau Francophone Numérique (RFN)</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Principal réservoir de l'espace francophone regroupant les collections patrimoniales de bibliothèques nationales (France, Belgique, Suisse, Maroc, Sénégal). Objectif : préserver et diffuser le patrimoine documentaire commun aux 300 millions de francophones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://rfnum.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Visiter le site <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* Europeana */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Europeana</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Agrégateur central du patrimoine culturel européen. Opère au sein de l'Espace européen commun des données pour le patrimoine culturel, une initiative de l'Union européenne visant à moderniser la numérisation et la réutilisation des données culturelles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://www.europeana.eu/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Visiter le site <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* IFLA */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">IFLA</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Fédération Internationale des Associations de Bibliothécaires. Définit les normes internationales (IFLA LRM) permettant l'interopérabilité entre les grands réservoirs mondiaux. Promeut le "Manifeste pour les bibliothèques numériques".
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://www.ifla.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Visiter le site <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* UNESCO Digital Library */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Bibliothèque Numérique de l'UNESCO</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Réservoir mondial spécialisé dans les politiques culturelles et le patrimoine documentaire mondial, incluant les contributions de la conférence MONDIACULT.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://unesdoc.unesco.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Visiter le site <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>

            {/* World Digital Library */}
            <Card className="hover:shadow-lg transition-all hover:scale-[1.02] group">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">World Digital Library (WDL)</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Projet mené par la Library of Congress et l'UNESCO pour rendre accessibles des documents culturels rares de tous les pays du monde.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="https://www.loc.gov/collections/world-digital-library/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  Visiter le site <ExternalLink className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
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
