import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WatermarkContainer } from "@/components/ui/watermark";
import { RolePermissionsMatrix } from "@/components/roles/RolePermissionsMatrix";
import { RoleCreator } from "@/components/roles/RoleCreator";
import { PermissionSearch } from "@/components/roles/PermissionSearch";
import { RolesList } from "@/components/roles/RolesList";
import { 
  Shield, 
  Users, 
  Search,
  Plus,
  Settings,
  ArrowLeft,
  Library,
  BookOpen,
  Calendar,
  Archive,
  FileText
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RolesManagement() {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  // Vérification des permissions
  if (!user || !profile || !['admin', 'librarian'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const platforms = [
    { id: "all", name: "Toutes les plateformes", icon: Shield, color: "bg-primary" },
    { id: "bnrm", name: "Portail BNRM", icon: Library, color: "bg-blue-500" },
    { id: "digital_library", name: "Bibliothèque Numérique", icon: BookOpen, color: "bg-green-500" },
    { id: "manuscripts", name: "Plateforme Manuscrits", icon: FileText, color: "bg-amber-500" },
    { id: "cbm", name: "Plateforme CBM", icon: Archive, color: "bg-purple-500" },
    { id: "kitab", name: "Plateforme Kitab", icon: BookOpen, color: "bg-rose-500" },
    { id: "cultural", name: "Activités Culturelles", icon: Calendar, color: "bg-cyan-500" }
  ];

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM - Gestion des Rôles et Habilitations", 
        variant: "subtle", 
        position: "corner",
        opacity: 0.03
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-10">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/admin/settings">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Gestion des Rôles et Habilitations</h1>
                  <p className="text-xs text-muted-foreground">
                    Administration des permissions système
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                {profile?.first_name} {profile?.last_name}
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container py-8 space-y-8">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un rôle, permission ou module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <RoleCreator />
          </div>

          {/* Platform Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtrer par plateforme</CardTitle>
              <CardDescription>
                Sélectionnez une plateforme pour voir ses modules et permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <Button
                      key={platform.id}
                      variant={selectedPlatform === platform.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPlatform(platform.id)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {platform.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="matrix" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matrix">Matrice des Permissions</TabsTrigger>
              <TabsTrigger value="roles">Gestion des Rôles</TabsTrigger>
              <TabsTrigger value="search">Recherche Avancée</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="space-y-6">
              <RolePermissionsMatrix 
                searchQuery={searchQuery}
                selectedPlatform={selectedPlatform}
              />
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <RolesList />
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <PermissionSearch searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </WatermarkContainer>
  );
}
