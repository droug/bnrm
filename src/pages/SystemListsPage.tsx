import { useState } from "react";
import { AdminHeader } from "@/components/AdminHeader";
import { SystemListsManager } from "@/components/SystemListsManager";
import { AutocompleteListsManager } from "@/components/AutocompleteListsManager";
import { WatermarkContainer } from "@/components/ui/watermark";
import { PermissionGuard } from "@/hooks/usePermissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Network, Building2, BookOpen, FileText, Users, Landmark, Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Définition des plateformes du système BNRM
const PLATFORMS = [
  {
    id: "all",
    name: "Toutes les plateformes",
    description: "Afficher toutes les listes du système",
    icon: Building2,
    color: "bg-slate-100 text-slate-700 border-slate-300"
  },
  {
    id: "BNRM",
    name: "Portail BNRM",
    description: "Listes communes du portail principal",
    icon: Landmark,
    color: "bg-emerald-100 text-emerald-700 border-emerald-300"
  },
  {
    id: "DIGITAL_LIBRARY",
    name: "Bibliothèque Numérique",
    description: "Collections numériques et documents digitaux",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 border-blue-300"
  },
  {
    id: "MANUSCRIPTS",
    name: "Manuscrits",
    description: "Gestion des manuscrits et archives",
    icon: FileText,
    color: "bg-amber-100 text-amber-700 border-amber-300"
  },
  {
    id: "KITAB",
    name: "Kitab",
    description: "Plateforme de gestion des livres",
    icon: Library,
    color: "bg-purple-100 text-purple-700 border-purple-300"
  },
  {
    id: "CULTURAL_ACTIVITIES",
    name: "Activités Culturelles",
    description: "Événements et activités culturelles",
    icon: Users,
    color: "bg-pink-100 text-pink-700 border-pink-300"
  },
  {
    id: "CBM",
    name: "CBM",
    description: "Catalogue Bibliographique Marocain",
    icon: Library,
    color: "bg-orange-100 text-orange-700 border-orange-300"
  }
];

export default function SystemListsPage() {
  const [activeTab, setActiveTab] = useState("dropdowns");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  return (
    <PermissionGuard permission="content.manage">
      <WatermarkContainer 
        watermarkProps={{ 
          text: "BNRM Administration - Accès Protégé", 
          variant: "subtle", 
          position: "pattern",
          opacity: 0.02
        }}
      >
        <div className="min-h-screen bg-background">
          <AdminHeader 
            title="Gestion des listes système"
            subtitle="Configurez les listes déroulantes et auto-complètes du Portail BNRM et ses 5 plateformes"
          />
          
          <main className="container py-8 space-y-6">
            {/* Sélecteur de plateforme */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Filtrer par plateforme</CardTitle>
                <CardDescription>
                  Sélectionnez une plateforme pour afficher ses listes système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                          "hover:shadow-md hover:scale-[1.02]",
                          isSelected 
                            ? `${platform.color} border-current shadow-md` 
                            : "bg-background border-border hover:border-muted-foreground/30"
                        )}
                      >
                        <Icon className={cn(
                          "w-6 h-6",
                          isSelected ? "" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-xs font-medium text-center leading-tight",
                          isSelected ? "" : "text-muted-foreground"
                        )}>
                          {platform.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {selectedPlatform !== "all" && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {PLATFORMS.find(p => p.id === selectedPlatform)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Onglets listes déroulantes / auto-complètes */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dropdowns" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Listes déroulantes
                </TabsTrigger>
                <TabsTrigger value="autocomplete" className="flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Listes auto-complètes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dropdowns" className="space-y-4">
                <SystemListsManager platformFilter={selectedPlatform} />
              </TabsContent>

              <TabsContent value="autocomplete" className="space-y-4">
                <AutocompleteListsManager platformFilter={selectedPlatform} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </WatermarkContainer>
    </PermissionGuard>
  );
}
