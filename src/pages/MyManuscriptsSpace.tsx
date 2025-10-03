import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Heart, 
  BookMarked, 
  Star,
  Clock,
  Download,
  Eye,
  Calendar,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

interface ReadingHistory {
  id: string;
  manuscript_id: string;
  action_type: string;
  page_number: number | null;
  created_at: string;
  manuscript: {
    title: string;
    author: string;
    thumbnail_url: string;
    permalink: string;
  };
}

interface Favorite {
  id: string;
  manuscript_id: string;
  title: string;
  author: string;
  thumbnail_url: string | null;
  created_at: string;
  content_type: string;
  notes: string | null;
}

interface Bookmark {
  id: string;
  manuscript_id: string;
  page_number: number;
  note: string | null;
  created_at: string;
  manuscript: {
    title: string;
    author: string;
    permalink: string;
  };
}

interface Review {
  id: string;
  manuscript_id: string;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  manuscript: {
    title: string;
    author: string;
  };
}

const MyManuscriptsSpace = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [readingHistory, setReadingHistory] = useState<ReadingHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchAllData();
    }
  }, [user, authLoading, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchReadingHistory(),
      fetchFavorites(),
      fetchBookmarks(),
      fetchReviews()
    ]);
    setLoading(false);
  };

  const fetchReadingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscript_reading_history')
        .select(`
          *,
          manuscript:manuscripts(title, author, thumbnail_url, permalink)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Add mock data if empty
      if (!data || data.length === 0) {
        const mockData: ReadingHistory[] = [
          {
            id: '1',
            manuscript_id: '1',
            action_type: 'read',
            page_number: 45,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Kitab al-Shifa (Le Livre de la Guérison)',
              author: 'Ibn Sina (Avicenne)',
              thumbnail_url: '',
              permalink: 'kitab-al-shifa'
            }
          },
          {
            id: '2',
            manuscript_id: '2',
            action_type: 'download',
            page_number: null,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Muqaddimah (Introduction à l\'Histoire universelle)',
              author: 'Ibn Khaldoun',
              thumbnail_url: '',
              permalink: 'muqaddimah'
            }
          },
          {
            id: '3',
            manuscript_id: '3',
            action_type: 'read',
            page_number: 12,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Rihla (Le Voyage)',
              author: 'Ibn Battuta',
              thumbnail_url: '',
              permalink: 'rihla'
            }
          }
        ];
        setReadingHistory(mockData);
      } else {
        setReadingHistory(data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('content_type', 'manuscript')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock data if empty
      if (!data || data.length === 0) {
        const mockData: Favorite[] = [
          {
            id: '1',
            manuscript_id: '1',
            title: 'Al-Qanun fi al-Tibb (Canon de la Médecine)',
            author: 'Ibn Sina (Avicenne)',
            thumbnail_url: null,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            content_type: 'manuscript',
            notes: 'Référence importante pour mes recherches sur la médecine médiévale'
          },
          {
            id: '2',
            manuscript_id: '2',
            title: 'Kitab al-Hayawan (Le Livre des Animaux)',
            author: 'Al-Jahiz',
            thumbnail_url: null,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            content_type: 'manuscript',
            notes: null
          },
          {
            id: '3',
            manuscript_id: '3',
            title: 'Diwan de Poésie Andalouse',
            author: 'Ibn Zaydun',
            thumbnail_url: null,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            content_type: 'manuscript',
            notes: 'Belle collection de poèmes, à relire'
          }
        ];
        setFavorites(mockData);
      } else {
        setFavorites(data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des favoris:", error);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscript_bookmarks')
        .select(`
          *,
          manuscript:manuscripts(title, author, permalink)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock data if empty
      if (!data || data.length === 0) {
        const mockData: Bookmark[] = [
          {
            id: '1',
            manuscript_id: '1',
            page_number: 78,
            note: 'Chapitre intéressant sur les plantes médicinales',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Kitab al-Nabat (Le Livre des Plantes)',
              author: 'Al-Dinawari',
              permalink: 'kitab-al-nabat'
            }
          },
          {
            id: '2',
            manuscript_id: '2',
            page_number: 134,
            note: null,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Al-Kitab al-Mukhtar fi Kashf al-Asrar',
              author: 'Al-Razi',
              permalink: 'kashf-al-asrar'
            }
          }
        ];
        setBookmarks(mockData);
      } else {
        setBookmarks(data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des marque-pages:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('manuscript_reviews')
        .select(`
          *,
          manuscript:manuscripts(title, author)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock data if empty
      if (!data || data.length === 0) {
        const mockData: Review[] = [
          {
            id: '1',
            manuscript_id: '1',
            rating: 5,
            comment: 'Excellente numérisation, qualité d\'image exceptionnelle. Merci à la BNRM pour ce travail remarquable.',
            status: 'approved',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Al-Jami\' li-Mufradat al-Adwiya wa-l-Aghdhiya',
              author: 'Ibn al-Baytar'
            }
          },
          {
            id: '2',
            manuscript_id: '2',
            rating: 4,
            comment: 'Très bon document, mais quelques pages mériteraient une meilleure résolution.',
            status: 'pending',
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Kitab al-Manazir (Livre de l\'Optique)',
              author: 'Ibn al-Haytham'
            }
          },
          {
            id: '3',
            manuscript_id: '3',
            rating: 5,
            comment: 'Document précieux parfaitement préservé. Interface de lecture très intuitive.',
            status: 'approved',
            created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            manuscript: {
              title: 'Kitab Surat al-Ard (Livre de la Configuration de la Terre)',
              author: 'Al-Khwarizmi'
            }
          }
        ];
        setReviews(mockData);
      } else {
        setReviews(data);
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des évaluations:", error);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== id));
      toast.success("Favori supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const removeBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manuscript_bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success("Marque-page supprimé");
    } catch (error: any) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'approved':
        return <Badge variant="default">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Espace Manuscrits</h1>
          <p className="text-muted-foreground">
            Gérez vos lectures, favoris et évaluations
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favoris ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarks">
              <BookMarked className="h-4 w-4 mr-2" />
              Marque-pages ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Évaluations ({reviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Historique */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historique de Consultation
                </CardTitle>
                <CardDescription>
                  Vos dernières consultations et téléchargements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {readingHistory.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun historique de consultation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {readingHistory.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-20 bg-muted rounded flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">
                                  {item.manuscript?.title || 'Manuscrit'}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {item.manuscript?.author}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    {item.action_type === 'read' ? (
                                      <Eye className="h-3 w-3" />
                                    ) : (
                                      <Download className="h-3 w-3" />
                                    )}
                                    {item.action_type === 'read' ? 'Consultation' : 'Téléchargement'}
                                  </span>
                                  {item.page_number && (
                                    <span>Page {item.page_number}</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3"
                                  onClick={() => navigate(`/manuscrit/${item.manuscript?.permalink || item.manuscript_id}`)}
                                >
                                  Reprendre la lecture
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favoris */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Mes Favoris
                </CardTitle>
                <CardDescription>
                  Les manuscrits que vous avez sauvegardés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {favorites.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun favori</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((favorite) => (
                        <Card key={favorite.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-20 bg-muted rounded flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{favorite.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {favorite.author}
                                </p>
                                {favorite.notes && (
                                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                    {favorite.notes}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/manuscrit/${favorite.manuscript_id}`)}
                                  >
                                    Consulter
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFavorite(favorite.id)}
                                  >
                                    Retirer
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marque-pages */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5" />
                  Mes Marque-pages
                </CardTitle>
                <CardDescription>
                  Reprenez vos lectures là où vous les avez laissées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun marque-page</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookmarks.map((bookmark) => (
                        <Card key={bookmark.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">
                                  {bookmark.manuscript?.title}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {bookmark.manuscript?.author}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="secondary">
                                    Page {bookmark.page_number}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(bookmark.created_at)}
                                  </span>
                                </div>
                                {bookmark.note && (
                                  <p className="text-sm text-muted-foreground mt-2 italic">
                                    "{bookmark.note}"
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/manuscrit/${bookmark.manuscript?.permalink || bookmark.manuscript_id}`)}
                                >
                                  Reprendre
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeBookmark(bookmark.id)}
                                >
                                  Retirer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Évaluations */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Mes Évaluations
                </CardTitle>
                <CardDescription>
                  Vos commentaires à destination de la BNRM (non publics)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune évaluation</p>
                      <p className="text-sm mt-2">
                        Laissez des commentaires après avoir consulté un manuscrit
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">
                                    {review.manuscript?.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {review.manuscript?.author}
                                  </p>
                                </div>
                                {getStatusBadge(review.status)}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>

                              {review.comment && (
                                <>
                                  <Separator />
                                  <p className="text-sm">{review.comment}</p>
                                </>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                <span>Créé le {formatDate(review.created_at)}</span>
                                {review.updated_at !== review.created_at && (
                                  <span>Modifié le {formatDate(review.updated_at)}</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyManuscriptsSpace;