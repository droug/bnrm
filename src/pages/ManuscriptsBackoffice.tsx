import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Users, FileText, BarChart3, Settings, Shield, Archive, Database, FileSearch } from "lucide-react";
import { ManuscriptsManager } from "@/components/manuscripts/ManuscriptsManager";
import { ManuscriptsAnalytics } from "@/components/manuscripts/ManuscriptsAnalytics";
import { ManuscriptsSettings } from "@/components/manuscripts/ManuscriptsSettings";
import { ManuscriptsAccessControl } from "@/components/manuscripts/ManuscriptsAccessControl";
import { MetadataImportManager } from "@/components/manuscripts/MetadataImportManager";
import { PartnerCollectionsApproval } from "@/components/manuscripts/PartnerCollectionsApproval";
import { PartnerManuscriptSubmissions } from "@/components/manuscripts/PartnerManuscriptSubmissions";

export default function ManuscriptsBackoffice() {
  const { user, loading, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("manuscripts");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-moroccan font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-gold" />
            Gestion Manuscrits Numérisés
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestion complète de la plateforme des manuscrits numérisés
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2 bg-card/50 p-2 h-auto">
            <TabsTrigger value="manuscripts" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Manuscrits</span>
            </TabsTrigger>
            
            <TabsTrigger value="metadata" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              <span className="hidden sm:inline">Métadonnées</span>
            </TabsTrigger>
            
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Partenaires</span>
            </TabsTrigger>
            
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Accès</span>
            </TabsTrigger>
            
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistiques</span>
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>

            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Collections</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-280px)] mt-6">
            <TabsContent value="manuscripts" className="space-y-4">
              <ManuscriptsManager />
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <MetadataImportManager />
            </TabsContent>

            <TabsContent value="partners" className="space-y-4">
              <PartnerCollectionsApproval />
              <div className="mt-6">
                <PartnerManuscriptSubmissions />
              </div>
            </TabsContent>

            <TabsContent value="access" className="space-y-4">
              <ManuscriptsAccessControl />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <ManuscriptsAnalytics />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <ManuscriptsSettings />
            </TabsContent>

            <TabsContent value="collections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    Gestion des Collections
                  </CardTitle>
                  <CardDescription>
                    Organisation et classification des manuscrits par collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Module de gestion des collections à venir...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
