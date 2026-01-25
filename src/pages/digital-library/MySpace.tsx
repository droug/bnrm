import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MySpaceHeaderBN } from "@/components/digital-library/my-space/MySpaceHeaderBN";
import { MySpaceMediaBookmarks } from "@/components/digital-library/my-space/MySpaceMediaBookmarks";
import { MySpacePrivateFeedback } from "@/components/digital-library/my-space/MySpacePrivateFeedback";
import { MySpaceRecentReadings } from "@/components/digital-library/my-space/MySpaceRecentReadings";
import { MySpaceLoans } from "@/components/digital-library/my-space/MySpaceLoans";
import { MySpaceAnnotations } from "@/components/digital-library/my-space/MySpaceAnnotations";
import { MyRestorationRequests } from "@/components/restoration/MyRestorationRequests";
import { cn } from "@/lib/utils";

export default function MySpace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [favorites, setFavorites] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const handleConsultDocument = (item: any) => {
    const isManuscript = item.content_type === 'manuscript' || item.manuscript_id;
    
    if (isManuscript) {
      const manuscriptId = item.manuscript_id || item.content_id;
      navigate(`/manuscript-reader/${manuscriptId}`);
    } else {
      const documentId = item.content_id || item.id;
      navigate(`/digital-library/book-reader/${documentId}`);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [favoritesRes, downloadsRes] = await Promise.all([
        supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("reading_history")
          .select("*")
          .eq("user_id", user.id)
          .eq("action_type", "download")
          .order("created_at", { ascending: false })
          .limit(10)
      ]);

      if (favoritesRes.error) throw favoritesRes.error;
      if (downloadsRes.error) throw downloadsRes.error;

      setFavorites(favoritesRes.data || []);
      setDownloads(downloadsRes.data || []);
    } catch (error: any) {
      console.error("Error loading user data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: "mdi:view-dashboard" },
    { id: "loans", label: "Mes emprunts", icon: "mdi:book-open-page-variant" },
    { id: "requests", label: "Mes demandes", icon: "mdi:file-document-edit" },
    { id: "annotations", label: "Mes annotations", icon: "mdi:note-text" },
    { id: "favorites", label: "Favoris", icon: "mdi:heart" },
    { id: "downloads", label: "Téléchargements", icon: "mdi:download" },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <MySpaceHeaderBN />

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-card rounded-xl border shadow-sm p-1.5">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 bg-transparent h-auto gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "flex items-center gap-2 py-3 px-3 rounded-lg transition-all data-[state=active]:bg-bn-blue-primary data-[state=active]:text-white data-[state=active]:shadow-md",
                    "hover:bg-muted/50 text-xs sm:text-sm"
                  )}
                >
                  <Icon icon={tab.icon} className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Readings */}
              <MySpaceRecentReadings />

              {/* Media Bookmarks */}
              <MySpaceMediaBookmarks />
            </div>

            {/* Private Feedback */}
            <MySpacePrivateFeedback />
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="mt-0">
            <MySpaceLoans />
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-0">
            <Card className="border-bn-blue-primary/10">
              <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
                <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Icon icon="mdi:file-document-edit" className="h-5 w-5 text-purple-600" />
                  </div>
                  Suivi de mes demandes
                </CardTitle>
                <CardDescription>Gérez vos demandes de restauration et autres services</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="restoration" className="space-y-4">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger value="restoration" className="gap-2">
                      <Icon icon="mdi:auto-fix" className="h-4 w-4" />
                      Restauration
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="restoration">
                    <MyRestorationRequests />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Annotations Tab */}
          <TabsContent value="annotations" className="mt-0">
            <MySpaceAnnotations />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="mt-0">
            <Card className="border-bn-blue-primary/10">
              <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
                <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
                  <div className="p-2 rounded-lg bg-red-100">
                    <Icon icon="mdi:heart" className="h-5 w-5 text-red-500" />
                  </div>
                  Mes Favoris
                </CardTitle>
                <CardDescription>Documents que vous avez ajoutés à vos favoris</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Icon icon="mdi:heart-off-outline" className="h-16 w-16 mx-auto text-muted-foreground/30" />
                    <div>
                      <p className="text-muted-foreground">Aucun favori</p>
                      <p className="text-sm text-muted-foreground/70">
                        Explorez la bibliothèque et ajoutez des documents à vos favoris
                      </p>
                    </div>
                    <Button onClick={() => navigate("/digital-library")} className="mt-4 bg-bn-blue-primary hover:bg-bn-blue-dark">
                      <Icon icon="mdi:bookshelf" className="h-4 w-4 mr-2" />
                      Parcourir la bibliothèque
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-gold-bn-primary/30 hover:bg-accent/30 transition-all cursor-pointer group"
                        onClick={() => handleConsultDocument(item)}
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-14 h-18 object-cover rounded shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-18 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <Icon icon="mdi:book-open-page-variant" className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          {item.author && <p className="text-sm text-muted-foreground truncate">{item.author}</p>}
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className="text-xs">{item.content_type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-gold-bn-primary hover:bg-gold-bn-primary/90"
                        >
                          <Icon icon="mdi:eye" className="h-4 w-4 mr-1" />
                          Consulter
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="mt-0">
            <Card className="border-bn-blue-primary/10">
              <CardHeader className="bg-gradient-to-r from-bn-blue-primary/5 to-gold-bn-primary/5">
                <CardTitle className="flex items-center gap-3 text-bn-blue-primary">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Icon icon="mdi:download" className="h-5 w-5 text-green-600" />
                  </div>
                  Mes Téléchargements
                </CardTitle>
                <CardDescription>Documents que vous avez téléchargés</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
                  </div>
                ) : downloads.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Icon icon="mdi:download-off" className="h-16 w-16 mx-auto text-muted-foreground/30" />
                    <div>
                      <p className="text-muted-foreground">Aucun téléchargement</p>
                      <p className="text-sm text-muted-foreground/70">
                        Les documents que vous téléchargez apparaîtront ici
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {downloads.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-gold-bn-primary/30 hover:bg-accent/30 transition-all"
                      >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Icon icon="mdi:file-download" className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{item.title}</h3>
                          {item.author && <p className="text-sm text-muted-foreground truncate">{item.author}</p>}
                          <span className="text-xs text-muted-foreground">
                            Téléchargé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
