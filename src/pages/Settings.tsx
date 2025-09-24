import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  ArrowLeft,
  Key,
  Archive,
  Edit
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionsManager } from "@/components/PermissionsManager";
import ArchivingManager from "@/components/ArchivingManager";
import WysiwygEditor from "@/components/wysiwyg/WysiwygEditor";

const SettingsPage = () => {
  const { profile } = useAuth();

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Settings - Configuration", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Accueil
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">Paramètres Administrateur</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 p-6 bg-gradient-primary rounded-lg text-primary-foreground shadow-moroccan">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <SettingsIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    Configuration Système - {profile?.first_name} {profile?.last_name}
                  </h1>
                  <p className="text-primary-foreground/80">
                    Gérez les permissions utilisateurs et les paramètres d'archivage
                  </p>
                </div>
              </div>

              {/* Settings Tabs */}
              <Tabs defaultValue="permissions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
                  <TabsTrigger value="permissions" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Permissions
                  </TabsTrigger>
                  <TabsTrigger value="archiving" className="flex items-center gap-2">
                    <Archive className="h-4 w-4" />
                    Archivage
                  </TabsTrigger>
                  <TabsTrigger value="wysiwyg" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Éditeur WYSIWYG
                  </TabsTrigger>
                </TabsList>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-6">
                  <PermissionsManager />
                </TabsContent>

                {/* Archiving Tab */}
                <TabsContent value="archiving" className="space-y-6">
                  <ArchivingManager />
                </TabsContent>

                {/* WYSIWYG Editor Tab */}
                <TabsContent value="wysiwyg" className="space-y-6">
                  <Card className="shadow-soft">
                    <CardHeader>
                      <CardTitle>Éditeur WYSIWYG</CardTitle>
                      <CardDescription>
                        Éditeur visuel pour créer et modifier du contenu de manière intuitive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="border rounded-lg overflow-hidden">
                        <WysiwygEditor />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </WatermarkContainer>
  );
};

export default SettingsPage;