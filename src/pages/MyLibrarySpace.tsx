import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Heart, 
  Bookmark, 
  Star, 
  Trash2, 
  Eye, 
  Download, 
  MessageSquare,
  Clock,
  Book,
  FileText,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RestorationNotifications } from "@/components/restoration/RestorationNotifications";
import { MyRestorationRequests } from "@/components/restoration/MyRestorationRequests";

interface ReadingHistoryItem {
  id: string;
  content_type: string;
  action_type: string;
  title: string;
  author: string | null;
  thumbnail_url: string | null;
  last_page_read: number | null;
  reading_progress: number;
  created_at: string;
  manuscript_id: string | null;
  content_id: string | null;
}

interface Favorite {
  id: string;
  content_type: string;
  title: string;
  author: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
  manuscript_id: string | null;
  content_id: string | null;
}

interface UserBookmark {
  id: string;
  page_number: number;
  note: string | null;
  created_at: string;
  manuscript_id: string | null;
  content_id: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  is_reviewed_by_admin: boolean;
  admin_response: string | null;
  created_at: string;
  manuscript_id: string | null;
  content_id: string | null;
}

export default function MyLibrarySpace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [newReview, setNewReview] = useState({
    contentId: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [historyRes, favoritesRes, bookmarksRes, reviewsRes] = await Promise.all([
        supabase
          .from('reading_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (historyRes.data) setReadingHistory(historyRes.data);
      if (favoritesRes.data) setFavorites(favoritesRes.data);
      if (bookmarksRes.data) setBookmarks(bookmarksRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast({
        title: "Supprimé",
        description: "Le favori a été supprimé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le favori.",
        variant: "destructive",
      });
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
      toast({
        title: "Supprimé",
        description: "Le marque-page a été supprimé.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le marque-page.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'download':
        return <Download className="h-4 w-4" />;
      case 'read':
        return <Book className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'view':
        return 'Consultation';
      case 'download':
        return 'Téléchargement';
      case 'read':
        return 'Lecture';
      default:
        return actionType;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
              <p className="text-muted-foreground mb-4">
                Vous devez être connecté pour accéder à votre espace.
              </p>
              <Button onClick={() => navigate('/auth')}>Se connecter</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mon Espace</h1>
          <p className="text-muted-foreground">
            Gérez vos demandes, vos lectures, favoris, marque-pages et évaluations
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historique ({readingHistory.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoris ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Marque-pages ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Évaluations ({reviews.length})
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Mes Restaurations
            </TabsTrigger>
          </TabsList>

          {/* Historique Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique de consultation</CardTitle>
                <CardDescription>
                  Retrouvez l'historique de vos consultations, lectures et téléchargements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {readingHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun historique pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {readingHistory.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                    {item.author && (
                                      <p className="text-sm text-muted-foreground">{item.author}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="flex items-center gap-1">
                                    {getActionIcon(item.action_type)}
                                    {getActionLabel(item.action_type)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(item.created_at)}
                                  </span>
                                  {item.last_page_read && (
                                    <span>Page {item.last_page_read}</span>
                                  )}
                                  {item.reading_progress > 0 && (
                                    <Badge variant="secondary">
                                      {Math.round(item.reading_progress)}% lu
                                    </Badge>
                                  )}
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

          {/* Favoris Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mes Favoris</CardTitle>
                <CardDescription>
                  Documents et manuscrits que vous avez marqués comme favoris
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun favori pour le moment</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                {item.author && (
                                  <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                                )}
                                <Badge variant="outline">{item.content_type}</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFavorite(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground mb-2 italic">
                                "{item.notes}"
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Ajouté le {formatDate(item.created_at)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marque-pages Tab */}
          <TabsContent value="bookmarks">
            <Card>
              <CardHeader>
                <CardTitle>Mes Marque-pages</CardTitle>
                <CardDescription>
                  Pages marquées pour reprendre votre lecture plus tard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun marque-page pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookmarks.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge>Page {item.page_number}</Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>
                                {item.note && (
                                  <p className="text-sm text-muted-foreground italic">
                                    {item.note}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBookmark(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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

          {/* Évaluations Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Mes Évaluations et Commentaires</CardTitle>
                <CardDescription>
                  Partagez vos impressions avec les gestionnaires de la BNRM (privé)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.is_reviewed_by_admin && (
                                  <Badge variant="secondary">Répondu</Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                            <p className="text-sm mb-3">{review.comment}</p>
                            {review.admin_response && (
                              <div className="bg-muted p-3 rounded-md">
                                <p className="text-xs font-semibold mb-1">Réponse de l'administrateur :</p>
                                <p className="text-sm">{review.admin_response}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid gap-6 md:grid-cols-2">
              <RestorationNotifications />
              <MyRestorationRequests />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}