import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Download, Clock, Eye, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MySpace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Load reading history
      const { data: historyData, error: historyError } = await supabase
        .from("reading_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (historyError) throw historyError;
      setReadingHistory(historyData || []);

      // Load favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (favoritesError) throw favoritesError;
      setFavorites(favoritesData || []);

      // Load downloads
      const { data: downloadsData, error: downloadsError } = await supabase
        .from("reading_history")
        .select("*")
        .eq("user_id", user.id)
        .eq("action_type", "download")
        .order("created_at", { ascending: false })
        .limit(10);

      if (downloadsError) throw downloadsError;
      setDownloads(downloadsData || []);
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

  const stats = [
    { label: "Documents consultés", value: readingHistory.length.toString(), icon: Eye, color: "text-blue-600" },
    { label: "Heures de lecture", value: "N/A", icon: Clock, color: "text-green-600" },
    { label: "Favoris", value: favorites.length.toString(), icon: Heart, color: "text-red-600" },
    { label: "Téléchargements", value: downloads.length.toString(), icon: Download, color: "text-purple-600" },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mon Espace Personnel</h1>
          <p className="text-lg text-muted-foreground">
            Retrouvez votre historique de lecture, favoris et téléchargements
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              Historique de lecture
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Favoris
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />
              Téléchargements
            </TabsTrigger>
          </TabsList>

          {/* Reading History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique de lecture</CardTitle>
                <CardDescription>Documents que vous avez consultés récemment</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : readingHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune lecture récente</p>
                    <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                      Parcourir la bibliothèque
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {readingHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(item.content_id ? `/digital-library/document/${item.content_id}` : `/manuscripts/${item.manuscript_id}`)}
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-16 h-20 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.author && <p className="text-sm text-muted-foreground">{item.author}</p>}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">{item.content_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            {item.reading_progress !== null && item.reading_progress > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {Math.round(item.reading_progress)}% lu
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm">Reprendre</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mes Favoris</CardTitle>
                <CardDescription>Documents que vous avez ajoutés à vos favoris</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun favori</p>
                    <Button className="mt-4" onClick={() => navigate("/digital-library")}>
                      Parcourir la bibliothèque
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-16 h-20 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.author && <p className="text-sm text-muted-foreground">{item.author}</p>}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">{item.content_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          {item.notes && <p className="text-xs text-muted-foreground italic mt-2">{item.notes}</p>}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(item.content_id ? `/digital-library/document/${item.content_id}` : `/manuscripts/${item.manuscript_id}`)}
                        >
                          Consulter
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Downloads */}
          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>Mes Téléchargements</CardTitle>
                <CardDescription>Documents téléchargés disponibles pour consultation hors ligne</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Chargement...</p>
                ) : downloads.length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun téléchargement</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {downloads.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt={item.title} className="w-16 h-20 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-20 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                            <Download className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.author && <p className="text-sm text-muted-foreground">{item.author}</p>}
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline">{item.content_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Téléchargé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
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
