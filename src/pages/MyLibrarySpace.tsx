import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  LogIn
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MyRestorationRequests } from "@/components/restoration/MyRestorationRequests";
import { MyReproductionRequests } from "@/components/my-space/MyReproductionRequests";
import { MyLegalDeposits } from "@/components/my-space/MyLegalDeposits";
import { MyBookReservations } from "@/components/my-space/MyBookReservations";
import { MySpaceReservations } from "@/components/my-space/MySpaceReservations";
import { MySpaceHeader } from "@/components/my-space/MySpaceHeader";
import { MySpaceStats } from "@/components/my-space/MySpaceStats";
import { MySpaceNavigation } from "@/components/my-space/MySpaceNavigation";
import { MyDonorSpace } from "@/components/my-space/MyDonorSpace";
import { ArbitrationWorkflow } from "@/components/legal-deposit/ArbitrationWorkflow";

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

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export default function MyLibrarySpace() {
  const { user } = useAuth();
  const { isValidator } = useSecureRoles();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [arbitrationCount, setArbitrationCount] = useState(0);
  
  // Détermine l'onglet initial en fonction des paramètres URL ou du rôle
  const getInitialTab = () => {
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;
    if (isValidator) return "arbitration";
    return "restoration";
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Stats data
  const [stats, setStats] = useState({
    legalDeposits: 0,
    bookReservations: 0,
    spaceReservations: 0,
    reproductions: 0,
    restorations: 0,
    pending: 0,
    completed: 0,
  });

  // User profiles for conditional navigation
  const [userProfiles, setUserProfiles] = useState({
    isProfessional: false,
    isDonor: false,
    isValidator: false,
    hasRestorations: false,
    hasReproductions: false,
    hasBookReservations: false,
    hasSpaceReservations: false,
  });

  // Mettre à jour le tab si paramètre URL change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Mettre à jour isValidator dans userProfiles
  useEffect(() => {
    setUserProfiles(prev => ({ ...prev, isValidator }));
  }, [isValidator]);

  // Fetch arbitration count for validators
  useEffect(() => {
    if (isValidator) {
      fetchArbitrationCount();
    }
  }, [isValidator]);

  const fetchArbitrationCount = async () => {
    try {
      const { count } = await supabase
        .from("legal_deposit_requests")
        .select("*", { count: "exact", head: true })
        .eq("arbitration_requested", true)
        .eq("arbitration_status", "pending");
      setArbitrationCount(count || 0);
    } catch (error) {
      console.error("Error fetching arbitration count:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      fetchStats();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      // Fetch counts in parallel
      const [
        bookingsRes,
        reservationsRes,
        reproductionsRes,
        restorationsRes,
        donorRes,
      ] = await Promise.all([
        supabase.from('bookings').select('id, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('reservations_ouvrages').select('id, statut', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('reproduction_requests').select('id, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('restoration_requests').select('id, status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('donors').select('id').eq('user_id', user.id).maybeSingle(),
      ]);

      // Get professional registry for legal deposits
      let profId: string | null = null;
      const { data: profData } = await supabase
        .from('professional_registry')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profData) {
        profId = profData.id;
      } else {
        const { data: profReqData } = await supabase
          .from('professional_registration_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
        if (profReqData) profId = profReqData.id;
      }

      let legalDeposits = 0;
      let ldPending = 0;
      let ldCompleted = 0;

      // Deposits as initiator
      const initiatorIds = new Set<string>();
      if (profId) {
        const { data: ldData } = await supabase
          .from('legal_deposit_requests')
          .select('id, status')
          .eq('initiator_id', profId);
        if (ldData) {
          ldData.forEach(d => initiatorIds.add(d.id));
          legalDeposits += ldData.length;
          ldPending += ldData.filter(d => ['brouillon', 'soumis', 'en_attente_validation_b', 'en_attente_comite_validation'].includes(d.status)).length;
          ldCompleted += ldData.filter(d => ['attribue', 'termine'].includes(d.status)).length;
        }
      }

      // Deposits as party (printer, editor, etc.)
      const { data: partyData } = await supabase
        .from('legal_deposit_parties')
        .select('request_id')
        .eq('user_id', user.id);

      if (partyData && partyData.length > 0) {
        const uniquePartyIds = partyData
          .map(p => p.request_id)
          .filter((id): id is string => !!id && !initiatorIds.has(id));

        if (uniquePartyIds.length > 0) {
          const { data: partyLdData } = await supabase
            .from('legal_deposit_requests')
            .select('id, status')
            .in('id', uniquePartyIds);
          if (partyLdData) {
            legalDeposits += partyLdData.length;
            ldPending += partyLdData.filter(d => ['brouillon', 'soumis', 'en_attente_validation_b', 'en_attente_comite_validation'].includes(d.status)).length;
            ldCompleted += partyLdData.filter(d => ['attribue', 'termine'].includes(d.status)).length;
          }
        }
      }

      // Calculate pending and completed
      const bookingsPending = bookingsRes.data?.filter(b => b.status === 'en_attente')?.length || 0;
      const bookingsCompleted = bookingsRes.data?.filter(b => ['approuvee', 'terminee'].includes(b.status))?.length || 0;
      
      const reservationsPending = reservationsRes.data?.filter(r => ['soumise', 'en_cours'].includes(r.statut))?.length || 0;
      const reservationsCompleted = reservationsRes.data?.filter(r => r.statut === 'validee')?.length || 0;
      
      const reproPending = reproductionsRes.data?.filter(r => ['soumise', 'en_traitement'].includes(r.status))?.length || 0;
      const reproCompleted = reproductionsRes.data?.filter(r => r.status === 'terminee')?.length || 0;
      
      const restoPending = restorationsRes.data?.filter(r => ['soumise', 'en_cours'].includes(r.status))?.length || 0;
      const restoCompleted = restorationsRes.data?.filter(r => r.status === 'terminee')?.length || 0;

      setStats({
        legalDeposits,
        bookReservations: reservationsRes.data?.length || 0,
        spaceReservations: bookingsRes.data?.length || 0,
        reproductions: reproductionsRes.data?.length || 0,
        restorations: restorationsRes.data?.length || 0,
        pending: bookingsPending + reservationsPending + reproPending + restoPending + ldPending,
        completed: bookingsCompleted + reservationsCompleted + reproCompleted + restoCompleted + ldCompleted,
      });

      // Set user profiles based on data
      const hasProfessionalAccess = !!profId || legalDeposits > 0;
      setUserProfiles(prev => ({
        ...prev,
        isProfessional: hasProfessionalAccess,
        isDonor: !!donorRes.data,
        hasRestorations: (restorationsRes.data?.length || 0) > 0,
        hasReproductions: (reproductionsRes.data?.length || 0) > 0,
        hasBookReservations: (reservationsRes.data?.length || 0) > 0,
        hasSpaceReservations: (bookingsRes.data?.length || 0) > 0,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'restoration':
        return <MyRestorationRequests />;
      case 'reproduction':
        return <MyReproductionRequests />;
      case 'legal-deposit':
        return <MyLegalDeposits />;
      case 'book-reservation':
        return <MyBookReservations />;
      case 'space-reservation':
        return <MySpaceReservations />;
      case 'mecenat':
        return <MyDonorSpace />;
      case 'arbitration':
        return <ArbitrationWorkflow />;
      case 'history':
        return renderHistory();
      case 'favorites':
        return renderFavorites();
      case 'bookmarks':
        return renderBookmarks();
      case 'reviews':
        return renderReviews();
      default:
        return isValidator ? <ArbitrationWorkflow /> : <MyRestorationRequests />;
    }
  };

  const renderHistory = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Historique de consultation
        </CardTitle>
        <CardDescription>
          Retrouvez l'historique de vos consultations, lectures et téléchargements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {readingHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Aucun historique pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {readingHistory.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{item.title}</h3>
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
                            <Badge variant="secondary" className="text-xs">
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
  );

  const renderFavorites = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Mes Favoris
        </CardTitle>
        <CardDescription>
          Documents et manuscrits que vous avez marqués comme favoris
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-rose-300" />
              </div>
              <p className="text-muted-foreground">Aucun favori pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        {item.author && (
                          <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                        )}
                        <Badge variant="outline">{item.content_type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
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
  );

  const renderBookmarks = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-indigo-500" />
          Mes Marque-pages
        </CardTitle>
        <CardDescription>
          Pages marquées pour reprendre votre lecture plus tard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-indigo-300" />
              </div>
              <p className="text-muted-foreground">Aucun marque-page pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-all duration-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            Page {item.page_number}
                          </Badge>
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
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
  );

  const renderReviews = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-teal-500" />
          Mes Évaluations et Commentaires
        </CardTitle>
        <CardDescription>
          Partagez vos impressions avec les gestionnaires de la BNRM (privé)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-teal-300" />
              </div>
              <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted'
                              }`}
                            />
                          ))}
                        </div>
                        {review.is_reviewed_by_admin && (
                          <Badge variant="secondary" className="text-xs">Répondu</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{review.comment}</p>
                    {review.admin_response && (
                      <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-l-primary">
                        <p className="text-xs font-semibold mb-1 text-primary">Réponse de l'administrateur :</p>
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
  );

  // Génère l'URL de redirection pour l'auth avec le chemin actuel incluant les paramètres
  const getCurrentPathWithParams = () => {
    const currentPath = `/my-space${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return `/auth?redirect=${encodeURIComponent(currentPath)}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <Card className="max-w-md mx-auto border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <LogIn className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connexion requise</h2>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour accéder à votre espace personnel
              </p>
              <Button onClick={() => navigate(getCurrentPathWithParams())} size="lg" className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <main className="container py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de votre espace...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Header avec profil */}
        <MySpaceHeader profile={profile} />

        {/* Statistiques */}
        <MySpaceStats stats={stats} loading={loading} />

        {/* Layout principal avec navigation et contenu */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation latérale */}
          <div className="lg:col-span-4 xl:col-span-3">
            <MySpaceNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              counts={{
                restoration: stats.restorations,
                reproduction: stats.reproductions,
                legalDeposit: stats.legalDeposits,
                bookReservation: stats.bookReservations,
                spaceReservation: stats.spaceReservations,
                history: readingHistory.length,
                favorites: favorites.length,
                bookmarks: bookmarks.length,
                reviews: reviews.length,
                mecenat: 0,
                arbitration: arbitrationCount,
              }}
              userProfiles={userProfiles}
            />
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-8 xl:col-span-9">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
