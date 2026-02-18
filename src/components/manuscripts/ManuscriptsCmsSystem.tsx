import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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
  MonitorPlay,
} from "lucide-react";
import ManuscriptPartnershipsBackoffice from "@/components/manuscripts/ManuscriptPartnershipsBackoffice";
import CmsBannersManager from "@/components/cms/CmsBannersManager";
import CmsMediaManager from "@/components/cms/CmsMediaManager";
import CmsStyleManager from "@/components/cms/CmsStyleManager";

// CMS sub-items grouped into a single card
const cmsItems = [
  {
    id: "hero",
    label: "Section Hero",
    icon: Home,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    description: "Titre, sous-titre et image de la section héro",
  },
  {
    id: "bannieres",
    label: "Bannières",
    icon: Megaphone,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    description: "Bannières promotionnelles de la plateforme",
  },
  {
    id: "medias",
    label: "Médiathèque",
    icon: ImageIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: "Bibliothèque d'images et fichiers",
  },
  {
    id: "styles",
    label: "Styles & Design",
    icon: Palette,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    description: "Couleurs, typographies et apparence visuelle",
  },
];

// Standalone cards (not CMS)
const standaloneCards = [
  {
    id: "partenariats",
    label: "Demandes de partenariat",
    icon: Handshake,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500/20 to-amber-600/5",
    description: "Gestion des demandes soumises via le formulaire Devenir Partenaire",
  },
  {
    id: "backoffice",
    label: "Back-office complet",
    icon: LayoutDashboard,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    gradient: "from-indigo-500/20 to-indigo-600/5",
    description: "Accès à l'interface d'administration complète des manuscrits",
    isExternal: true,
    externalRoute: "/admin/manuscripts-backoffice",
  },
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

const allCards = [...cmsItems, ...standaloneCards];

export default function ManuscriptsCmsSystem() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const navigate = useNavigate();

  if (activeTab) {
    const card = allCards.find((c) => c.id === activeTab);
    if (!card) return null;
    const Icon = card.icon;
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab(null)}
            className="gap-2 hover:bg-primary/5 hover:text-primary"
          >
            ← Retour
          </Button>
          <div className={`p-2.5 rounded-xl ${card.bgColor}`}>
            <Icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{card.label}</h2>
            <p className="text-sm text-muted-foreground">{card.description}</p>
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

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Carte CMS unifiée */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="lg:col-span-1"
        >
          <Card className="border border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <MonitorPlay className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Système de Gestion de Contenu
                </CardTitle>
              </div>
              <CardDescription className="text-sm">
                Gérez l'apparence et le contenu éditorial de la plateforme manuscrits.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col flex-1 gap-2">
              {cmsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                      "hover:bg-muted/60 border border-transparent hover:border-border group"
                    )}
                  >
                    <div className={`p-1.5 rounded-lg ${item.bgColor} shrink-0`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cartes standalone */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {standaloneCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    "group relative overflow-hidden border cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-col h-full",
                    card.borderColor,
                    "hover:border-primary/40"
                  )}
                  onClick={() => {
                    if (card.isExternal) navigate(card.externalRoute!);
                    else setActiveTab(card.id);
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <CardHeader className="relative pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {card.isExternal && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground mt-3 group-hover:text-primary transition-colors">
                      {card.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative pt-0 flex flex-col flex-1 justify-between">
                    <CardDescription className="text-sm leading-relaxed mb-4">
                      {card.description}
                    </CardDescription>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full group-hover:border-primary/50 group-hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.isExternal) navigate(card.externalRoute!);
                        else setActiveTab(card.id);
                      }}
                    >
                      {card.isExternal ? "Ouvrir" : "Accéder"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
