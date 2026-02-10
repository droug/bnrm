import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CmsPagesManager from "@/components/cms/CmsPagesManager";
import CmsWebhooksManager from "@/components/cms/CmsWebhooksManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsActualitesManager from "@/components/cms/CmsActualitesManager";
import CmsEvenementsManager from "@/components/cms/CmsEvenementsManager";
import CmsMenusManager from "@/components/cms/CmsMenusManager";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import CmsFooterManager from "@/components/cms/CmsFooterManager";
import CmsFooterManagerBN from "@/components/cms/CmsFooterManagerBN";
import CmsSectionsManager from "@/components/cms/CmsSectionsManager";
import CmsHeroManagerBN from "@/components/cms/CmsHeroManagerBN";
import CmsStyleManager from "@/components/cms/CmsStyleManager";
import CmsVExpo360HeroManager from "@/components/cms/CmsVExpo360HeroManager";
import CmsSectionIconsManager from "@/components/cms/CmsSectionIconsManager";
import CmsAboutManagerBN from "@/components/cms/CmsAboutManagerBN";
import CmsHelpManagerBN from "@/components/cms/CmsHelpManagerBN";
import CmsTooltipsManagerBN from "@/components/cms/CmsTooltipsManagerBN";
import FeaturedWorksManager from "@/components/admin/FeaturedWorksManager";
import { Icon } from "@/components/ui/icon";
import { 
  Sparkles, 
  FileText, 
  Webhook, 
  ImageIcon, 
  Newspaper, 
  CalendarDays, 
  Menu,
  Megaphone,
  TrendingUp,
  Footprints,
  LayoutTemplate,
  Home,
  BookOpen,
  Library,
  Scroll,
  Palette,
  Globe,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import { useNavigate } from "react-router-dom";

// Modules spécifiques à la Bibliothèque Numérique (BN) - Organisés par catégorie
const tabs = [
  // === SECTIONS HOMEPAGE ===
  { 
    id: "hero", 
    label: "Hero BN", 
    icon: Home, 
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-600/5",
    description: "Section Hero de la Bibliothèque Numérique",
    category: "homepage"
  },
  { 
    id: "carrousel-bn", 
    label: "Œuvres Vedettes", 
    icon: Sparkles, 
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-600/5",
    description: "Carrousel des œuvres mises en avant",
    category: "homepage"
  },
  { 
    id: "vexpo360-hero", 
    label: "Section VExpo 360°", 
    icon: Globe, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-500/20 to-purple-600/5",
    description: "Paramètres Hero de la section VExpo",
    category: "homepage"
  },
  { 
    id: "bannieres", 
    label: "Bannières BN", 
    icon: Megaphone, 
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-500/20 to-pink-600/5",
    description: "Bannières de la Bibliothèque Numérique",
    category: "homepage"
  },
  // === CONTENU ===
  { 
    id: "about", 
    label: "Page À propos", 
    icon: null,
    iconMdi: null,
    logoUrl: "/Logo_BN.png",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-500/20 to-sky-600/5",
    description: "Mission, vision et valeurs de la BN",
    category: "content"
  },
  { 
    id: "actualites", 
    label: "Actualités BN", 
    icon: Newspaper, 
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500/20 to-blue-600/5",
    description: "Actualités de la Bibliothèque Numérique",
    category: "content"
  },
  { 
    id: "evenements", 
    label: "Événements BN", 
    icon: CalendarDays, 
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    gradient: "from-green-500/20 to-green-600/5",
    description: "Événements de la Bibliothèque Numérique",
    category: "content"
  },
  { 
    id: "pages", 
    label: "Pages BN", 
    icon: FileText, 
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    gradient: "from-purple-500/20 to-purple-600/5",
    description: "Pages statiques de la BN",
    category: "content"
  },
  { 
    id: "sections", 
    label: "Sections", 
    icon: LayoutTemplate, 
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    gradient: "from-violet-500/20 to-violet-600/5",
    description: "Blocs de contenu des pages",
    category: "content"
  },
  { 
    id: "help", 
    label: "Aide & FAQ", 
    icon: null,
    iconMdi: "mdi:help-circle-outline",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    gradient: "from-teal-500/20 to-teal-600/5",
    description: "Page d'aide et questions fréquentes",
    category: "content"
  },
  // === DESIGN & STRUCTURE ===
  { 
    id: "styles", 
    label: "Styles & Design", 
    icon: Palette, 
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    borderColor: "border-fuchsia-500/30",
    gradient: "from-fuchsia-500/20 to-fuchsia-600/5",
    description: "Couleurs, polices et boutons",
    category: "design"
  },
  { 
    id: "icons", 
    label: "Icônes des sections", 
    icon: null,
    iconMdi: "mdi:shape-outline",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    gradient: "from-teal-500/20 to-teal-600/5",
    description: "Personnaliser les icônes MDI",
    category: "design"
  },
  { 
    id: "menus", 
    label: "Menus BN", 
    icon: Menu, 
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    gradient: "from-cyan-500/20 to-cyan-600/5",
    description: "Navigation de la BN",
    category: "design"
  },
  { 
    id: "footer", 
    label: "Footer BN", 
    icon: Footprints, 
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    gradient: "from-slate-500/20 to-slate-600/5",
    description: "Pied de page de la BN",
    category: "design"
  },
  { 
    id: "tooltips", 
    label: "Infobulles", 
    icon: null,
    iconMdi: "mdi:tooltip-text-outline",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    description: "Textes descriptifs au survol des menus",
    category: "design"
  },
  // === MÉDIAS & TECHNIQUE ===
  { 
    id: "media", 
    label: "Médias BN", 
    icon: ImageIcon, 
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    gradient: "from-orange-500/20 to-orange-600/5",
    description: "Bibliothèque de médias BN",
    category: "technical"
  },
  { 
    id: "webhooks", 
    label: "Webhooks", 
    icon: Webhook, 
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    gradient: "from-gray-500/20 to-gray-600/5",
    description: "Intégrations externes",
    category: "technical"
  },
];

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "primary",
  description 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  trend?: string; 
  color?: string;
  description?: string;
}) {
  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    primary: { bg: "bg-primary/5", text: "text-primary", iconBg: "bg-primary/10" },
    blue: { bg: "bg-blue-500/5", text: "text-blue-500", iconBg: "bg-blue-500/10" },
    green: { bg: "bg-green-500/5", text: "text-green-500", iconBg: "bg-green-500/10" },
    amber: { bg: "bg-amber-500/5", text: "text-amber-500", iconBg: "bg-amber-500/10" },
    pink: { bg: "bg-pink-500/5", text: "text-pink-500", iconBg: "bg-pink-500/10" },
    indigo: { bg: "bg-indigo-500/5", text: "text-indigo-500", iconBg: "bg-indigo-500/10" },
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
          {trend && (
            <div className="flex items-center gap-1 mt-3 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500 font-medium">{trend}</span>
              <span className="text-muted-foreground">vs dernier mois</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Liens vers les interfaces dédiées
const dedicatedInterfaces = [
  {
    id: "vexpo360",
    label: "CMS Expositions Virtuelles 360°",
    icon: Globe,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    route: "/admin/vexpo360",
    description: "Gérer les panoramas, hotspots et expositions"
  },
  {
    id: "documents",
    label: "Gestion des Documents",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    route: "/admin/digital-library/documents",
    description: "Documents numériques de la bibliothèque"
  },
  {
    id: "manuscripts",
    label: "Gestion des Manuscrits",
    icon: Scroll,
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600/30",
    route: "/admin/manuscripts",
    description: "Manuscrits et documents anciens"
  },
  {
    id: "collections",
    label: "Gestion des Collections",
    icon: Library,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    route: "/admin/digital-library/collections",
    description: "Collections numériques"
  },
];

export default function ContentManagementSystem() {
  const [activeTab, setActiveTab] = useState("hero");
  const navigate = useNavigate();

  // Fetch stats pour la Bibliothèque Numérique
  const { data: stats } = useQuery({
    queryKey: ['bn-cms-stats'],
    queryFn: async () => {
      const [manuscripts, documents, collections, media] = await Promise.all([
        supabase.from('manuscripts').select('id', { count: 'exact' }),
        supabase.from('digital_library_documents').select('id', { count: 'exact' }),
        supabase.from('collections').select('id', { count: 'exact' }),
        supabase.from('cms_media').select('id', { count: 'exact' }),
      ]);

      return {
        manuscripts: manuscripts.count || 0,
        documents: documents.count || 0,
        collections: collections.count || 0,
        media: media.count || 0,
      };
    }
  });

  const activeTabData = tabs.find(t => t.id === activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "hero":
        return <CmsHeroManagerBN />;
      case "styles":
        return <CmsStyleManager platform="bn" />;
      case "icons":
        return <CmsSectionIconsManager platform="bn" />;
      case "carrousel-bn":
        return <FeaturedWorksManager />;
      case "vexpo360-hero":
        return <CmsVExpo360HeroManager />;
      case "bannieres":
        return <CmsBannersManager />;
      case "actualites":
        return <CmsActualitesManager />;
      case "evenements":
        return <CmsEvenementsManager />;
      case "pages":
        return <CmsPagesManager />;
      case "sections":
        return <CmsSectionsManager />;
      case "media":
        return <CmsMediaManager />;
      case "menus":
        return <CmsMenusManager />;
      case "footer":
        return <CmsFooterManagerBN />;
      case "webhooks":
        return <CmsWebhooksManager />;
      case "about":
        return <CmsAboutManagerBN />;
      case "help":
        return <CmsHelpManagerBN />;
      case "tooltips":
        return <CmsTooltipsManagerBN />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background shadow-lg overflow-hidden">
          <CardHeader className="pb-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />
            
            <div className="flex items-start gap-4 relative z-10">
              <motion.div 
                className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-inner"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <BookOpen className="h-8 w-8 text-indigo-600" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Gestion de la Bibliothèque Numérique
                </CardTitle>
                <CardDescription className="text-base mt-2 max-w-2xl">
                  Gérez les collections, manuscrits, œuvres vedettes et tout le contenu de la plateforme Ibn Battuta
                </CardDescription>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 relative z-10">
              <StatCard 
                title="Manuscrits" 
                value={stats?.manuscripts || 0}
                icon={Scroll}
                color="amber"
              />
              <StatCard 
                title="Documents" 
                value={stats?.documents || 0}
                icon={FileText}
                color="blue"
              />
              <StatCard 
                title="Collections" 
                value={stats?.collections || 0}
                icon={Library}
                color="indigo"
              />
              <StatCard 
                title="Médias" 
                value={stats?.media || 0}
                icon={ImageIcon}
                color="pink"
              />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Liens vers les interfaces dédiées */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Interfaces de gestion dédiées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {dedicatedInterfaces.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className={cn(
                      "h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all",
                      `hover:${item.borderColor}`
                    )}
                    onClick={() => navigate(item.route)}
                  >
                    <div className={cn("p-2 rounded-lg", item.bgColor)}>
                      <ItemIcon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-sm block">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground absolute top-3 right-3" />
                  </Button>
                );
              })}
            </div>
          </CardContent>
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
                Modules Bibliothèque Numérique
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-1">
                <nav className="space-y-1">
                  {tabs.map((tab, index) => {
                    const LucideIcon = tab.icon;
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
                          {(tab as any).logoUrl ? (
                            <img src={(tab as any).logoUrl} alt="" className="h-4 w-4 object-contain" />
                          ) : tab.iconMdi ? (
                            <Icon name={tab.iconMdi} className={cn("h-4 w-4", tab.color)} />
                          ) : LucideIcon ? (
                            <LucideIcon className={cn("h-4 w-4", tab.color)} />
                          ) : null}
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
              </div>
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
                {(activeTabData as any).logoUrl ? (
                  <img src={(activeTabData as any).logoUrl} alt="" className="h-5 w-5 object-contain" />
                ) : activeTabData.iconMdi ? (
                  <Icon name={activeTabData.iconMdi} className={cn("h-5 w-5", activeTabData.color)} />
                ) : activeTabData.icon ? (
                  <activeTabData.icon className={cn("h-5 w-5", activeTabData.color)} />
                ) : null}
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
