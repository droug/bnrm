import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Newspaper, Calendar, Menu, Image, Settings, Webhook } from "lucide-react";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";

export default function CmsBackoffice() {
  const { user, profile } = useAuth();

  // Seuls admin et librarian peuvent accéder
  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">CMS Headless - Bibliothèque Numérique</h1>
          <p className="text-muted-foreground mt-2">
            Gestion du contenu éditorial bilingue FR/AR avec workflow de publication
          </p>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="actualites" className="gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Actualités</span>
            </TabsTrigger>
            <TabsTrigger value="evenements" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Événements</span>
            </TabsTrigger>
            <TabsTrigger value="menus" className="gap-2">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Menus</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Médias</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" />
              <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <CmsPagesManager />
          </TabsContent>

          <TabsContent value="actualites" className="mt-6">
            <CmsActualitesManager />
          </TabsContent>

          <TabsContent value="evenements" className="mt-6">
            <CmsEvenementsManager />
          </TabsContent>

          <TabsContent value="menus" className="mt-6">
            <CmsMenusManager />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <CmsMediaManager />
          </TabsContent>

          <TabsContent value="webhooks" className="mt-6">
            <CmsWebhooksManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
