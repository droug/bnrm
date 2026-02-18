import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ImageIcon,
  Megaphone,
  BookOpen,
  Handshake,
  Palette,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
  Scroll,
} from "lucide-react";
import ManuscriptPartnershipsBackoffice from "@/components/manuscripts/ManuscriptPartnershipsBackoffice";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsStyleManager from "@/components/cms/CmsStyleManager";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// CMS sidebar modules
const cmsItems = [
  {
    id: "hero",
    label: "Section Hero",
    icon: Home,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-600/5",
    description: "Titre, sous-titre et image de la section héro",
  },
  {
    id: "bannieres",
    label: "Bannières",
    icon: Megaphone,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-500/20 to-pink-600/5",
    description: "Bannières promotionnelles de la plateforme",
  },
  {
    id: "medias",
    label: "Médiathèque",
    icon: ImageIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500/20 to-blue-600/5",
    description: "Bibliothèque d'images et fichiers",
  },
  {
    id: "styles",
    label: "Styles & Design",
    icon: Palette,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    gradient: "from-violet-500/20 to-violet-600/5",
    description: "Couleurs, typographies et apparence visuelle",
  },
];

// Dedicated interface links
const dedicatedInterfaces = [
  {
    id: "partenariats",
    label: "Demandes de partenariat",
    icon: Handshake,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    description: "Demandes soumises via le formulaire Devenir Partenaire",
    isExternal: false,
  },
  {
    id: "backoffice",
    label: "Back-office complet",
    icon: LayoutDashboard,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    description: "Interface d'administration complète des manuscrits",
    isExternal: true,
    externalRoute: "/admin/manuscripts-backoffice",
  },
];

const renderContent = (tabId: string) => {
  switch (tabId) {
    case "bannieres":
      return <CmsBannersManager />;
    case "partenariats":
      return <ManuscriptPartnershipsBackoffice />;
    case "medias":
      return <CmsMediaManager />;
    case "styles":
      return <CmsStyleManager platform="bn" />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">Module en cours de développement</p>
          <p className="text-sm mt-1 opacity-70">Ce module sera disponible prochainement.</p>
        </div>
      );
  }
};

export default function ManuscriptsCmsSystem() {
  const [activeTab, setActiveTab] = useState("hero");
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["manuscripts-cms-stats"],
    queryFn: async () => {
      const [manuscripts, media, partnerships] = await Promise.all([
        supabase.from("manuscripts").select("id", { count: "exact" }),
        supabase.from("cms_media").select("id", { count: "exact" }),
        supabase.from("access_requests").select("id", { count: "exact" }),
      ]);
      return {
        manuscripts: manuscripts.count || 0,
        media: media.count || 0,
        partnerships: partnerships.count || 0,
      };
    },
  });

  const activeTabData = cmsItems.find((t) => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header Card — same style as BN */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-none bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-background shadow-lg overflow-hidden">
          <CardHeader className="pb-6 relative">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-500/10 to-transparent rounded-full blur-2xl -ml-24 -mb-24" />

            <div className="flex items-start gap-4 relative z-10">
              <motion.div
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-inner"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Scroll className="h-8 w-8 text-amber-600" />
              </motion.div>
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold tracking-tight">
                  Gestion de la Plateforme Manuscrits
                </CardTitle>
                <CardDescription className="text-base mt-2 max-w-2xl">
                  Interface centralisée de gestion du contenu et des paramètres de la plateforme des manuscrits.
                </CardDescription>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
              {[
                { label: "Manuscrits", value: stats?.manuscripts ?? 0, icon: Scroll, color: "text-amber-600", bg: "bg-amber-500/10" },
                { label: "Médias", value: stats?.media ?? 0, icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Partenariats", value: stats?.partnerships ?? 0, icon: Handshake, color: "text-rose-500", bg: "bg-rose-500/10" },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                          <p className="text-3xl font-bold">{s.value}</p>
                        </div>
                        <div className={cn("p-3 rounded-xl", s.bg)}>
                          <s.icon className={cn("h-5 w-5", s.color)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Dedicated interfaces */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dedicatedInterfaces.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-md transition-all relative"
                    onClick={() => {
                      if (item.isExternal) navigate((item as any).externalRoute);
                      else setActiveTab(item.id);
                    }}
                  >
                    <div className={cn("p-2 rounded-lg", item.bgColor)}>
                      <Icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-sm block">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    {item.isExternal && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground absolute top-3 right-3" />
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Area with Sidebar — identical pattern to BN */}
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
                Système de Gestion de Contenu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {cmsItems.map((tab, index) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative",
                        isActive
                          ? `bg-gradient-to-r ${tab.gradient} border ${tab.borderColor} shadow-sm`
                          : "hover:bg-muted/60"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-colors flex-shrink-0",
                        isActive ? tab.bgColor : "bg-muted group-hover:bg-muted/80"
                      )}>
                        <Icon className={cn("h-3.5 w-3.5", tab.color)} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm truncate flex-1",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {tab.label}
                      </span>
                      <ChevronRight className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 transition-all",
                        isActive ? "opacity-60 text-muted-foreground" : "opacity-0 group-hover:opacity-40"
                      )} />
                    </motion.button>
                  );
                })}
              </nav>
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

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
