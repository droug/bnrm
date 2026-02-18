import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ImageIcon,
  FileText,
  Settings,
  Megaphone,
  BookOpen,
  Users,
  Handshake,
  BarChart3,
  Palette,
  ExternalLink,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import ManuscriptPartnershipsBackoffice from "@/components/manuscripts/ManuscriptPartnershipsBackoffice";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsStyleManager from "@/components/cms/CmsStyleManager";

// ---- Tabs definition ----
const tabs = [
  // ACCUEIL
  {
    id: "hero",
    label: "Section Hero",
    icon: Home,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    gradient: "from-rose-500/20 to-rose-600/5",
    description: "Titre, sous-titre et image de la section héro de la plateforme",
    category: "accueil",
  },
  {
    id: "bannieres",
    label: "Bannières",
    icon: Megaphone,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    gradient: "from-pink-500/20 to-pink-600/5",
    description: "Gestion des bannières promotionnelles de la plateforme",
    category: "accueil",
  },
  // CONTENU
  {
    id: "partenariats",
    label: "Demandes de partenariat",
    icon: Handshake,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-600/5",
    description: "Gestion des demandes soumises via le formulaire Devenir Partenaire",
    category: "contenu",
  },
  {
    id: "medias",
    label: "Médiathèque",
    icon: ImageIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500/20 to-blue-600/5",
    description: "Bibliothèque d'images et fichiers de la plateforme manuscrits",
    category: "contenu",
  },
  // DESIGN
  {
    id: "styles",
    label: "Styles & Design",
    icon: Palette,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    gradient: "from-violet-500/20 to-violet-600/5",
    description: "Couleurs, typographies et apparence visuelle",
    category: "design",
  },
  // ADMINISTRATION
  {
    id: "backoffice",
    label: "Back-office complet",
    icon: LayoutDashboard,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    description: "Accès à l'interface d'administration complète des manuscrits",
    category: "administration",
    isExternal: true,
    externalRoute: "/admin/manuscripts-backoffice",
  },
];

const categories = [
  { id: "all", label: "Tout", icon: LayoutDashboard },
  { id: "accueil", label: "Accueil", icon: Home },
  { id: "contenu", label: "Contenu", icon: FileText },
  { id: "design", label: "Design", icon: Palette },
  { id: "administration", label: "Administration", icon: Settings },
];

const renderTabContent = (tabId: string) => {
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
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const filteredTabs =
    activeCategory === "all"
      ? tabs
      : tabs.filter((t) => t.category === activeCategory);

  if (activeTab) {
    const tab = tabs.find((t) => t.id === activeTab);
    if (!tab) return null;
    const Icon = tab.icon;
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab(null)}
            className="gap-2 hover:bg-primary/5 hover:text-primary"
          >
            ← Retour
          </Button>
          <div className={`p-2.5 rounded-xl ${tab.bgColor}`}>
            <Icon className={`h-5 w-5 ${tab.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{tab.label}</h2>
            <p className="text-sm text-muted-foreground">{tab.description}</p>
          </div>
        </div>

        <div className="bg-background rounded-xl border p-6">
          {renderTabContent(activeTab)}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Gestion de la Plateforme Manuscrits
        </h1>
        <p className="text-muted-foreground">
          Interface centralisée de gestion du contenu et des paramètres de la plateforme des manuscrits.
        </p>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const CatIcon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat.id)}
              className="gap-2"
            >
              <CatIcon className="h-4 w-4" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Grille des modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                className={cn(
                  "group relative overflow-hidden border cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col",
                  tab.borderColor,
                  "hover:border-primary/40"
                )}
                onClick={() => {
                  if ((tab as any).isExternal) {
                    navigate((tab as any).externalRoute);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <CardHeader className="relative pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${tab.bgColor} ${tab.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {(tab as any).isExternal && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground mt-3 group-hover:text-primary transition-colors">
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0 flex flex-col flex-1 justify-between">
                  <CardDescription className="text-sm leading-relaxed mb-4">
                    {tab.description}
                  </CardDescription>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full group-hover:border-primary/50 group-hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ((tab as any).isExternal) {
                        navigate((tab as any).externalRoute);
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                  >
                    {(tab as any).isExternal ? "Ouvrir" : "Accéder"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
