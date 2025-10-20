import { useState } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Download, Clock, TrendingUp, Eye, Calendar, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function MySpace() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  const readingHistory = [
    {
      id: 1,
      title: "Al-Muqaddima (Les Prolégomènes)",
      author: "Ibn Khaldoun",
      lastRead: "2025-01-18",
      progress: 75,
      pages: "245/320",
      category: "Manuscrit",
    },
    {
      id: 2,
      title: "Rihla (Voyages)",
      author: "Ibn Battuta",
      lastRead: "2025-01-15",
      progress: 45,
      pages: "180/400",
      category: "Manuscrit",
    },
    {
      id: 3,
      title: "Histoire du Maroc moderne",
      author: "Archives BNRM",
      lastRead: "2025-01-10",
      progress: 100,
      pages: "150/150",
      category: "Livre",
    },
  ];

  const favorites = [
    {
      id: 1,
      title: "Al-Kulliyat fi al-Tibb",
      author: "Ibn Sina",
      addedDate: "2025-01-12",
      category: "Manuscrit",
      available: true,
    },
    {
      id: 2,
      title: "Kitab al-Shifa",
      author: "Ibn Sina",
      addedDate: "2025-01-08",
      category: "Manuscrit",
      available: true,
    },
    {
      id: 3,
      title: "Es-Saada - Journal historique",
      author: "Archives nationales",
      addedDate: "2024-12-20",
      category: "Périodique",
      available: false,
    },
  ];

  const downloads = [
    {
      id: 1,
      title: "Histoire du Maroc moderne",
      format: "PDF",
      size: "15 MB",
      downloadDate: "2025-01-10",
      expiresDate: "2025-02-10",
    },
    {
      id: 2,
      title: "Photographies du Maroc colonial",
      format: "ZIP",
      size: "125 MB",
      downloadDate: "2025-01-05",
      expiresDate: "2025-02-05",
    },
  ];

  const stats = [
    { label: "Documents consultés", value: "48", icon: Eye, color: "text-blue-600" },
    { label: "Heures de lecture", value: "127", icon: Clock, color: "text-green-600" },
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
                  <div className={`p-3 rounded-lg bg-gray-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Activité de lecture - 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {[12, 8, 15, 20, 10, 18, 25, 14, 22, 16, 19, 24, 11, 17].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t cursor-pointer"
                  style={{ height: `${height * 4}px` }}
                  title={`${height} documents`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Nombre de documents consultés par période de 2 jours
            </p>
          </CardContent>
        </Card>

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
                <div className="space-y-4">
                  {readingHistory.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/book-reader/${item.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.lastRead).toLocaleDateString('fr-FR')}
                          </span>
                          <span className="text-sm text-muted-foreground">{item.pages} pages</span>
                        </div>
                      </div>
                      <div className="ml-4 w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {favorites.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.author}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{item.category}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ajouté le {new Date(item.addedDate).toLocaleDateString('fr-FR')}
                          </span>
                          {item.available ? (
                            <Badge variant="default">Disponible</Badge>
                          ) : (
                            <Badge variant="destructive">Indisponible</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                          Retirer
                        </Button>
                        <Button size="sm" disabled={!item.available}>
                          <BookOpen className="h-4 w-4 mr-1" />
                          Consulter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {downloads.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline">{item.format}</Badge>
                          <span className="text-sm text-muted-foreground">{item.size}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Téléchargé le {new Date(item.downloadDate).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expire le {new Date(item.expiresDate).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Re-télécharger
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
