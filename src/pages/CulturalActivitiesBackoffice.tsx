import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CulturalActivitiesBackoffice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light text-foreground mb-2">
            Administration des Activités Culturelles
          </h1>
          <p className="text-muted-foreground font-light">
            Gestion centralisée de la plateforme d'activités culturelles
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="guided-tours">Visites guidées</TabsTrigger>
            <TabsTrigger value="spaces">Espaces culturels</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/guided-tours")}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">Visites guidées</CardTitle>
                      <CardDescription>Gestion des créneaux et réservations</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Accéder
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">Espaces culturels</CardTitle>
                      <CardDescription>Réservation de salles et espaces</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">Calendrier culturel</CardTitle>
                      <CardDescription>Événements et programmation</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">Rapports</CardTitle>
                      <CardDescription>Statistiques et analyses</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-light">Paramètres</CardTitle>
                      <CardDescription>Configuration de la plateforme</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Bientôt disponible
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guided-tours">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Gestion des visites guidées</CardTitle>
                <CardDescription>
                  Accédez à la page complète de gestion des visites guidées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/admin/guided-tours")}>
                  Ouvrir la gestion des visites guidées
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spaces">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Gestion des espaces culturels</CardTitle>
                <CardDescription>
                  Fonctionnalité en cours de développement
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Calendrier culturel</CardTitle>
                <CardDescription>
                  Fonctionnalité en cours de développement
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-light">Paramètres</CardTitle>
                <CardDescription>
                  Fonctionnalité en cours de développement
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesBackoffice;
