import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Image, Palette, FileText, Settings, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VExpo360Dashboard from "@/components/vexpo360/VExpo360Dashboard";
import VExpo360ExhibitionsList from "@/components/vexpo360/VExpo360ExhibitionsList";
import VExpo360ArtworksList from "@/components/vexpo360/VExpo360ArtworksList";
import VExpo360AuditLogs from "@/components/vexpo360/VExpo360AuditLogs";
import VExpo360Settings from "@/components/vexpo360/VExpo360Settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CmsVExpo360Manager() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Expositions Virtuelles 360°</CardTitle>
            <CardDescription>
              Créez et gérez des expositions virtuelles immersives avec panoramas 360° et hotspots interactifs
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/vexpo360")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir en plein écran
            </Button>
            <Button onClick={() => navigate("/admin/vexpo360/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Exposition
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
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

          <TabsContent value="audit">
            <VExpo360AuditLogs />
          </TabsContent>

          <TabsContent value="settings">
            <VExpo360Settings />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
