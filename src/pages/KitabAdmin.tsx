import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import KitabHeader from "@/components/KitabHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ArrowLeft, BookPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KitabNewPublicationsManager } from "@/components/kitab/KitabNewPublicationsManager";
import { KitabUpcomingPublicationsManager } from "@/components/kitab/KitabUpcomingPublicationsManager";

export default function KitabAdmin() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Restrict access to admin only
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/kitab" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-kitab-primary/5 to-kitab-secondary/5">
      <KitabHeader />
      <main className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/kitab")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au Portail Kitab
        </Button>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-kitab-primary to-kitab-secondary flex items-center justify-center shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-kitab-primary via-kitab-secondary to-kitab-accent bg-clip-text text-transparent">
                Administration Kitab
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Gestion du portail des publications marocaines
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6">
          {/* Carte Gestion des Nouvelles Parutions */}
          <Card className="border-kitab-primary/20 shadow-lg">
            <CardHeader className="border-b border-kitab-primary/10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-kitab-primary/20 to-kitab-secondary/20 flex items-center justify-center">
                  <BookPlus className="h-6 w-6 text-kitab-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-kitab-primary">
                    Gestion des Parutions
                  </CardTitle>
                  <CardDescription className="text-base">
                    Gestion des publications Kitab
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="nouvelles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="nouvelles">Nouvelles parutions</TabsTrigger>
                  <TabsTrigger value="a-paraitre">À paraître</TabsTrigger>
                </TabsList>
                <TabsContent value="nouvelles" className="mt-6">
                  <KitabNewPublicationsManager />
                </TabsContent>
                <TabsContent value="a-paraitre" className="mt-6">
                  <KitabUpcomingPublicationsManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Placeholder pour futures fonctionnalités d'administration */}
          {/* 
          <Card>
            <CardHeader>
              <CardTitle>Autres fonctionnalités d'administration</CardTitle>
            </CardHeader>
            <CardContent>
              ...
            </CardContent>
          </Card>
          */}
        </div>
      </main>
      <Footer forceKitabStyle />
    </div>
  );
}
