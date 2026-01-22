import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, Image, Palette, Users, FileText, Settings, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VExpo360Dashboard from "@/components/vexpo360/VExpo360Dashboard";
import VExpo360ExhibitionsList from "@/components/vexpo360/VExpo360ExhibitionsList";
import VExpo360ArtworksList from "@/components/vexpo360/VExpo360ArtworksList";
import VExpo360UserRoles from "@/components/vexpo360/VExpo360UserRoles";
import VExpo360AuditLogs from "@/components/vexpo360/VExpo360AuditLogs";
import VExpo360Settings from "@/components/vexpo360/VExpo360Settings";

export default function VirtualExhibitions360CMS() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exhibitions");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isLibrarian) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Accès refusé</h1>
            <p className="text-muted-foreground">
              Vous devez être connecté avec les droits appropriés pour accéder à cette section.
            </p>
            <Button onClick={() => navigate("/auth")} className="mt-4">
              Se connecter
            </Button>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/digital-library/exhibitions")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-bn-blue-primary">
                CMS Expositions Virtuelles 360°
              </h1>
              <p className="text-muted-foreground">
                Créez et gérez des expositions virtuelles immersives avec panoramas 360° et hotspots interactifs
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/admin/vexpo360/new")} className="bg-gold-bn hover:bg-gold-bn/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Exposition
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="exhibitions" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Expositions</span>
            </TabsTrigger>
            <TabsTrigger value="artworks" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Œuvres</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <VExpo360Dashboard />
          </TabsContent>

          <TabsContent value="exhibitions">
            <VExpo360ExhibitionsList />
          </TabsContent>

          <TabsContent value="artworks">
            <VExpo360ArtworksList />
          </TabsContent>

          <TabsContent value="users">
            <VExpo360UserRoles />
          </TabsContent>

          <TabsContent value="audit">
            <VExpo360AuditLogs />
          </TabsContent>

          <TabsContent value="settings">
            <VExpo360Settings />
          </TabsContent>
        </Tabs>
      </div>
    </DigitalLibraryLayout>
  );
}
