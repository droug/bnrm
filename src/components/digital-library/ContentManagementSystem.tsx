import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import FeaturedWorksManager from "@/components/admin/FeaturedWorksManager";
import { 
  Sparkles, 
  FileText, 
  Webhook, 
  ImageIcon, 
  Newspaper, 
  CalendarDays, 
  Menu,
  Megaphone,
  LayoutDashboard
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { 
    id: "carrousel-bn", 
    label: "Carrousel BN", 
    icon: Sparkles, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: "Œuvres vedettes de la bibliothèque numérique"
  },
  { 
    id: "bannieres", 
    label: "Bannières", 
    icon: Megaphone, 
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Bannières promotionnelles du site",
    badge: "Nouveau"
  },
  { 
    id: "actualites", 
    label: "Actualités", 
    icon: Newspaper, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Actualités et communiqués"
  },
  { 
    id: "evenements", 
    label: "Événements", 
    icon: CalendarDays, 
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Événements culturels"
  },
  { 
    id: "pages", 
    label: "Pages", 
    icon: FileText, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Pages statiques du site"
  },
  { 
    id: "media", 
    label: "Médias", 
    icon: ImageIcon, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Bibliothèque de médias"
  },
  { 
    id: "menus", 
    label: "Menus", 
    icon: Menu, 
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    description: "Navigation du site"
  },
  { 
    id: "webhooks", 
    label: "Webhooks", 
    icon: Webhook, 
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    description: "Intégrations externes"
  },
];

export default function ContentManagementSystem() {
  return (
    <div className="space-y-6">
      {/* Header amélioré */}
      <Card className="border-none bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <LayoutDashboard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Système de Gestion de Contenu
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Créez et gérez tout le contenu de la plateforme avec un éditeur enrichi, prévisualisation en temps réel et support bilingue
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="carrousel-bn" className="space-y-6">
        {/* Onglets modernisés avec icônes et couleurs */}
        <TabsList className="w-full h-auto p-1 bg-muted/50 grid grid-cols-4 lg:grid-cols-8 gap-1 rounded-xl">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id} 
              className="relative flex flex-col items-center gap-1.5 py-3 px-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <div className={`p-1.5 rounded-lg ${tab.bgColor} transition-colors`}>
                <tab.icon className={`h-4 w-4 ${tab.color}`} />
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.badge && (
                <Badge className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0 bg-pink-500 hover:bg-pink-500">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="carrousel-bn" className="space-y-4 mt-0">
          <FeaturedWorksManager />
        </TabsContent>

        <TabsContent value="bannieres" className="space-y-4 mt-0">
          <CmsBannersManager />
        </TabsContent>

        <TabsContent value="actualites" className="space-y-4 mt-0">
          <CmsActualitesManager />
        </TabsContent>

        <TabsContent value="evenements" className="space-y-4 mt-0">
          <CmsEvenementsManager />
        </TabsContent>

        <TabsContent value="pages" className="space-y-4 mt-0">
          <CmsPagesManager />
        </TabsContent>

        <TabsContent value="media" className="space-y-4 mt-0">
          <CmsMediaManager />
        </TabsContent>

        <TabsContent value="menus" className="space-y-4 mt-0">
          <CmsMenusManager />
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4 mt-0">
          <CmsWebhooksManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
