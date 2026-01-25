import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { AdminPageWrapper } from "@/components/digital-library/admin/AdminPageWrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import VExpo360Dashboard from "@/components/vexpo360/VExpo360Dashboard";
import VExpo360ExhibitionsList from "@/components/vexpo360/VExpo360ExhibitionsList";
import VExpo360ArtworksList from "@/components/vexpo360/VExpo360ArtworksList";
import VExpo360UserRoles from "@/components/vexpo360/VExpo360UserRoles";
import VExpo360AuditLogs from "@/components/vexpo360/VExpo360AuditLogs";
import VExpo360Settings from "@/components/vexpo360/VExpo360Settings";
import { Navigate } from "react-router-dom";

export default function VirtualExhibitions360CMS() {
  const { user } = useAuth();
  const { isLibrarian, loading } = useSecureRoles();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("exhibitions");

  if (loading) {
    return (
      <AdminPageWrapper
        title="CMS Expositions Virtuelles 360°"
        description="Gestion des expositions virtuelles immersives"
        icon="mdi:panorama-sphere-outline"
        iconColor="text-amber-600"
        iconBgColor="bg-amber-500/10"
        backPath="/admin/digital-library"
        loading={true}
      >
        <div />
      </AdminPageWrapper>
    );
  }

  if (!user || !isLibrarian) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminPageWrapper
      title="CMS Expositions Virtuelles 360°"
      description="Créez et gérez des expositions virtuelles immersives avec panoramas 360° et hotspots interactifs"
      icon="mdi:panorama-sphere-outline"
      iconColor="text-amber-600"
      iconBgColor="bg-amber-500/10"
      backPath="/admin/digital-library"
      actions={
        <Button 
          onClick={() => navigate("/admin/vexpo360/new")} 
          className="bg-gold-bn hover:bg-gold-bn/90 text-white gap-2"
        >
          <Icon icon="mdi:plus" className="h-4 w-4" />
          Nouvelle Exposition
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-muted/50">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Icon icon="mdi:view-dashboard-outline" className="h-4 w-4" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </TabsTrigger>
          <TabsTrigger value="exhibitions" className="flex items-center gap-2">
            <Icon icon="mdi:image-multiple-outline" className="h-4 w-4" />
            <span className="hidden sm:inline">Expositions</span>
          </TabsTrigger>
          <TabsTrigger value="artworks" className="flex items-center gap-2">
            <Icon icon="mdi:palette-outline" className="h-4 w-4" />
            <span className="hidden sm:inline">Œuvres</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Icon icon="mdi:account-group-outline" className="h-4 w-4" />
            <span className="hidden sm:inline">Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Icon icon="mdi:cog-outline" className="h-4 w-4" />
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
    </AdminPageWrapper>
  );
}
