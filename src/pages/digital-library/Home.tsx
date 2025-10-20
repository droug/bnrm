import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Image, Music, Calendar, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ReservationRequestDialog } from "@/components/digital-library/ReservationRequestDialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function DigitalLibraryHome() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [showReservationDialog, setShowReservationDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentDocuments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('content')
          .select('id, title, excerpt, content_type, published_at, file_url, file_type, tags, author_id')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6);

        if (data && !error) {
          // Charger les informations des auteurs
          const authorIds = [...new Set(data.map(item => item.author_id).filter(Boolean))];
          const { data: authorsData } = await supabase
            .from('profiles')
            .select('user_id, first_name, last_name')
            .in('user_id', authorIds);

          const authorsMap = new Map(
            authorsData?.map(author => [author.user_id, author]) || []
          );

          const formattedItems = data.map((item: any) => {
            const author = item.author_id ? authorsMap.get(item.author_id) : null;
            return {
              id: item.id,
              title: item.title,
              author: author 
                ? `${author.first_name || ''} ${author.last_name || ''}`.trim() || 'Auteur inconnu'
                : 'Auteur inconnu',
              type: item.content_type === 'news' ? 'Article' : 
                    item.content_type === 'event' ? 'Événement' : 
                    item.content_type === 'exhibition' ? 'Exposition' : 'Page',
              date: item.published_at,
              isAvailable: !!item.file_url,
              cote: item.file_type || 'DOC',
            };
          });
          
          console.log('Loaded documents:', formattedItems);
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

  const featuredCollections = [
    {
      id: "books",
      title: "Livres numériques",
      icon: BookOpen,
      count: "45,670",
      href: "/digital-library/collections/books",
    },
    {
      id: "periodicals",
      title: "Revues et périodiques",
      icon: FileText,
      count: "8,320",
      href: "/digital-library/collections/periodicals",
    },
    {
      id: "photos",
      title: "Photographies",
      icon: Image,
      count: "15,890",
      href: "/digital-library/collections/photos",
    },
    {
      id: "audiovisual",
      title: "Archives A/V",
      icon: Music,
      count: "2,890",
      href: "/digital-library/collections/audiovisual",
    },
  ];

  const featuredThemes = [
    { id: "history", title: "Histoire & Patrimoine", emoji: "🏛️", href: "/digital-library/themes/history" },
    { id: "arts", title: "Arts & Culture", emoji: "🎨", href: "/digital-library/themes/arts" },
    { id: "literature", title: "Littérature & Poésie", emoji: "✍️", href: "/digital-library/themes/literature" },
  ];

  return (
    <DigitalLibraryLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-foreground mb-4 animate-fade-in">
              Bienvenue à la Bibliothèque Numérique
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in">
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
                className="w-full"
              >
                <CarouselContent>
                  {newItems.map((item) => (
                    <CarouselItem key={item.id}>
                      <div className="p-1">
                        <Card className="border-2 hover:shadow-lg transition-shadow">
                          <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
                            <div className="flex-1">
                              <Badge className="mb-3">{item.type}</Badge>
                              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                              <p className="text-muted-foreground mb-4">{item.author}</p>
                              <p className="text-sm text-muted-foreground mb-4">Ajouté le {new Date(item.date).toLocaleDateString('fr-FR')}</p>
                              <div className="flex gap-2">
                                <Button size="lg" variant="outline" onClick={() => navigate(`/digital-library/documents/${item.id}`)}>
                                  Consulter
                                </Button>
                                {!item.isAvailable && session && userProfile && (
                                  <Button size="lg" onClick={() => handleReservationClick(item)}>
                                    🗓️ Réserver
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="w-full md:w-48 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center hover-scale">
                              <BookOpen className="h-16 w-16 text-primary/40" />
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
              <p className="text-muted-foreground">Chargement des documents...</p>
            </div>
          )}
          {!loading && newItems.length === 0 && (
            <div className="max-w-5xl mx-auto text-center py-12">
              <p className="text-muted-foreground">Aucun document disponible pour le moment</p>
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
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/40" />
                  </div>
                  <Badge variant="secondary" className="w-fit mb-2">{item.type}</Badge>
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>{item.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" variant="outline" onClick={() => navigate(`/digital-library/documents/${item.id}`)}>
                      Consulter
                    </Button>
                    {!item.isAvailable && session && userProfile && (
                      <Button className="w-full" onClick={() => handleReservationClick(item)}>
                        🗓️ Réserver
                      </Button>
                    )}
                  </div>
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
            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2">Nouvelle collection</Badge>
                <CardTitle>Manuscrits andalous numérisés</CardTitle>
                <CardDescription>
                  Découvrez notre dernière collection de 150 manuscrits andalous du XIIe au XVe siècle
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/digital-library/news/1">
                  <Button variant="outline" className="w-full">Lire la suite</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-purple-100 text-purple-800">Exposition</Badge>
                <CardTitle>Le Maroc à travers les âges</CardTitle>
                <CardDescription>
                  Une exposition virtuelle interactive sur l'histoire du Maroc
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/digital-library/news/2">
                  <Button variant="outline" className="w-full">Découvrir</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 py-12">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
          <CardContent className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100K+</div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">45K+</div>
                <div className="text-sm text-muted-foreground">Livres</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">12K+</div>
                <div className="text-sm text-muted-foreground">Manuscrits</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">15K+</div>
                <div className="text-sm text-muted-foreground">Images</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
