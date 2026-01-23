import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import CmsFooterManager from "@/components/cms/CmsFooterManager";
import CmsSectionsManager from "@/components/cms/CmsSectionsManager";
import CmsHeroManagerPortal from "@/components/cms/CmsHeroManagerPortal";
import CmsStyleManager from "@/components/cms/CmsStyleManager";
import CmsMediathequeManager from "@/components/cms/CmsMediathequeManager";
import CmsDigitalServicesManager from "@/components/cms/CmsDigitalServicesManager";
import CmsWysiwygModule from "@/components/cms/CmsWysiwygModule";
import CmsSeoManager from "@/components/cms/CmsSeoManager";
import {
  FileText, 
  Webhook, 
  ImageIcon, 
  Newspaper, 
  CalendarDays, 
  Menu,
  Megaphone,
  ChevronRight,
  TrendingUp,
  Home,
  Footprints,
  LayoutTemplate,
  Video,
  Globe,
  Info,
  MapPin,
  Building2,
  Users,
  BookOpen,
  Palette,
  Settings2,
  PenSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

// Modules spécifiques au Portail BNRM
const tabs = [
  { 
    id: "hero", 
    label: "Hero Portail", 
    icon: Home, 
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500/20 to-blue-600/5",
    description: "Section Hero de la page d'accueil"
  },
  { 
    id: "seo", 
    label: "SEO & Référencement", 
    icon: TrendingUp, 
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    gradient: "from-green-500/20 to-green-600/5",
    description: "Optimisation moteurs de recherche"
  },
  { 
    id: "wysiwyg", 
    label: "Éditeur WYSIWYG", 
    icon: PenSquare, 
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-500/20 to-pink-600/5",
    description: "Éditeur visuel multilingue"
  },
  { 
    id: "styles", 
    label: "Styles & Design", 
    icon: Palette, 
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    borderColor: "border-fuchsia-500/30",
    gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
    description: "Couleurs, polices et boutons"
  },
  { 
    id: "services-numeriques", 
    label: "Services Numériques", 
    icon: Settings2, 
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-500/20 to-sky-600/5",
    description: "Carousel des services numériques"
  },
  { 
    id: "mediatheque", 
    label: "Médiathèque", 
    icon: Video, 
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    gradient: "from-red-500/20 to-red-600/5",
    description: "Vidéos YouTube de la BNRM"
  },
  {
    id: "bannieres", 
    label: "Bannières", 
    icon: Megaphone, 
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-500/20 to-pink-600/5",
    description: "Bannières promotionnelles du portail"
  },
  { 
    id: "actualites", 
    label: "Actualités BNRM", 
    icon: Newspaper, 
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    description: "Actualités et annonces de la BNRM"
  },
  { 
    id: "evenements", 
    label: "Événements BNRM", 
    icon: CalendarDays, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    gradient: "from-orange-500/20 to-orange-600/5",
    description: "Programmation culturelle de la BNRM"
  },
  { 
    id: "infos-pratiques", 
    label: "Infos Pratiques", 
    icon: Info, 
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    gradient: "from-teal-500/20 to-teal-600/5",
    description: "Horaires, accès, tarifs"
  },
  { 
    id: "services", 
    label: "Services", 
    icon: Building2, 
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    gradient: "from-violet-500/20 to-violet-600/5",
    description: "Services proposés par la BNRM"
  },
  { 
    id: "espaces", 
    label: "Espaces", 
    icon: MapPin, 
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-600/5",
    description: "Espaces culturels et salles"
  },
  { 
    id: "pages", 
    label: "Pages Portail", 
    icon: FileText, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-500/20 to-purple-600/5",
    description: "Pages statiques du portail"
  },
  { 
    id: "sections", 
    label: "Sections", 
    icon: LayoutTemplate, 
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    description: "Blocs de contenu des pages"
  },
  { 
    id: "media", 
    label: "Médias", 
    icon: ImageIcon, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-600/5",
    description: "Bibliothèque d'images et fichiers"
  },
  { 
    id: "menus", 
    label: "Menus Portail", 
    icon: Menu, 
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    description: "Navigation du portail BNRM"
  },
  { 
    id: "footer", 
    label: "Footer Portail", 
    icon: Footprints, 
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    gradient: "from-slate-500/20 to-slate-600/5",
    description: "Pied de page du portail"
  },
  { 
    id: "webhooks", 
    label: "Webhooks", 
    icon: Webhook, 
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    gradient: "from-gray-500/20 to-gray-600/5",
    description: "Intégrations et notifications"
  },
];

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = "primary",
  description 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color?: string;
  description?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    primary: { bg: "bg-primary/5", text: "text-primary", iconBg: "bg-primary/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-500", iconBg: "bg-blue-500/10" },
    green: { bg: "bg-emerald-500/5", text: "text-emerald-500", iconBg: "bg-emerald-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-500", iconBg: "bg-amber-500/10" },
    pink: { bg: "bg-pink-500/5", text: "text-pink-500", iconBg: "bg-pink-500/10" },
    orange: { bg: "bg-orange-500/5", text: "text-orange-500", iconBg: "bg-orange-500/10" },
  };

  const classes = colorClasses[color] || colorClasses.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("border-none shadow-sm hover:shadow-md transition-all duration-300", classes.bg)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", classes.iconBg)}>
              <Icon className={cn("h-5 w-5", classes.text)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PortalContentManagementSystem() {
  const [activeTab, setActiveTab] = useState("hero");

  // Fetch stats pour le Portail BNRM
  const { data: stats } = useQuery({
    queryKey: ['portal-cms-stats'],
    queryFn: async () => {
      const [actualites, evenements, pages, media, bannieres, culturalSpaces] = await Promise.all([
        supabase.from('cms_actualites').select('id, status', { count: 'exact' }),
        supabase.from('cms_evenements').select('id, status', { count: 'exact' }),
        supabase.from('cms_pages').select('id, status', { count: 'exact' }),
        supabase.from('cms_media').select('id', { count: 'exact' }),
        supabase.from('cms_bannieres').select('id, is_active', { count: 'exact' }),
        supabase.from('cultural_spaces').select('id', { count: 'exact' }),
      ]);

      return {
        actualites: {
          total: actualites.count || 0,
          published: actualites.data?.filter(a => a.status === 'published').length || 0,
        },
        evenements: {
          total: evenements.count || 0,
          published: evenements.data?.filter(e => e.status === 'published').length || 0,
        },
        pages: pages.count || 0,
        bannieres: {
          total: bannieres.count || 0,
          active: bannieres.data?.filter(b => b.is_active).length || 0,
        },
        espaces: culturalSpaces.count || 0,
      };
    }
  });

  const activeTabData = tabs.find(t => t.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "hero":
        return <CmsHeroManagerPortal />;
      case "wysiwyg":
        return <CmsWysiwygModule />;
      case "styles":
        return <CmsStyleManager />;
      case "services-numeriques":
        return <CmsDigitalServicesManager />;
      case "bannieres":
        return <CmsBannersManager />;
      case "actualites":
        return <CmsActualitesManager />;
      case "evenements":
        return <CmsEvenementsManager />;
      case "infos-pratiques":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Informations Pratiques</CardTitle>
              <CardDescription>Gestion des horaires, accès et tarifs du portail BNRM</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module en développement - Gérez les informations pratiques affichées sur le portail.</p>
            </CardContent>
          </Card>
        );
      case "services":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Services BNRM</CardTitle>
              <CardDescription>Gestion des services proposés par la BNRM</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module en développement - Gérez les services affichés sur le portail.</p>
            </CardContent>
          </Card>
        );
      case "espaces":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Espaces Culturels</CardTitle>
              <CardDescription>Gestion des espaces et salles de la BNRM</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Module en développement - Accédez à la gestion des espaces depuis le menu Administration.</p>
            </CardContent>
          </Card>
        );
      case "pages":
        return <CmsPagesManager />;
      case "sections":
        return <CmsSectionsManager />;
      case "mediatheque":
        return <CmsMediathequeManager />;
      case "media":
        return <CmsMediaManager />;
      case "menus":
        return <CmsMenusManager />;
      case "footer":
        return <CmsFooterManager />;
      case "webhooks":
        return <CmsWebhooksManager />;
      case "seo":
        return <CmsSeoManager />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Header with Portal Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-background shadow-lg overflow-hidden">
          <CardHeader className="pb-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />
            
            <div className="flex items-start gap-4 relative z-10">
              <motion.div 
                className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 shadow-inner"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Globe className="h-8 w-8 text-blue-600" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Gestion du Portail BNRM
                </CardTitle>
                <CardDescription className="text-base mt-2 max-w-2xl">
                  Gérez le contenu de la page d'accueil, les actualités, événements, services et pages du portail 
                  avec un éditeur enrichi et support bilingue
                </CardDescription>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
              <StatCard 
                title="Actualités" 
                value={stats?.actualites.total || 0}
                icon={Newspaper}
                color="green"
                description={`${stats?.actualites.published || 0} publiées`}
              />
              <StatCard 
                title="Événements" 
                value={stats?.evenements.total || 0}
                icon={CalendarDays}
                color="orange"
                description={`${stats?.evenements.published || 0} publiés`}
              />
              <StatCard 
                title="Espaces" 
                value={stats?.espaces || 0}
                icon={MapPin}
                color="pink"
              />
              <StatCard 
                title="Bannières" 
                value={stats?.bannieres.total || 0}
                icon={Megaphone}
                color="blue"
                description={`${stats?.bannieres.active || 0} actives`}
              />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Main Content Area with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="sticky top-6 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Modules du Portail BNRM
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-auto max-h-[calc(100vh-300px)]">
                <nav className="space-y-1">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group relative",
                          isActive 
                            ? `bg-gradient-to-r ${tab.gradient} border ${tab.borderColor}` 
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isActive ? tab.bgColor : "bg-muted group-hover:bg-muted"
                        )}>
                          <Icon className={cn("h-4 w-4", tab.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "font-medium text-sm truncate block",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )}>
                            {tab.label}
                          </span>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {tab.description}
                          </p>
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-all",
                          isActive ? "opacity-100 text-muted-foreground" : "opacity-0 group-hover:opacity-50"
                        )} />
                      </motion.button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="min-w-0"
        >
          {/* Content Header */}
          {activeTabData && (
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("p-2 rounded-lg", activeTabData.bgColor)}>
                <activeTabData.icon className={cn("h-5 w-5", activeTabData.color)} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{activeTabData.label}</h2>
                <p className="text-sm text-muted-foreground">{activeTabData.description}</p>
              </div>
            </div>
          )}

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
