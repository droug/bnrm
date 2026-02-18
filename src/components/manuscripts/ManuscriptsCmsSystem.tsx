import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const adminModules = [
  {
    title: "Système de Gestion de Contenu",
    description: "CMS complet pour créer et gérer tout le contenu de la plateforme manuscrits",
    iconName: "mdi:file-image-outline",
    path: "/admin/content-management-manuscrits/cms",
    bgColor: "from-violet-500/10 to-purple-500/5",
    borderColor: "border-violet-500/20 hover:border-violet-500/40",
    iconColor: "text-violet-600",
  },
  {
    title: "Gestion des Manuscrits",
    description: "Ajouter, modifier et gérer les manuscrits de la collection",
    iconName: "mdi:scroll-text-outline",
    path: "/admin/manuscripts",
    bgColor: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    iconColor: "text-amber-600",
  },
  {
    title: "Demandes de partenariat",
    description: "Gestion des demandes soumises via le formulaire Devenir Partenaire",
    iconName: "mdi:handshake-outline",
    path: "/admin/content-management-manuscrits/partenariats",
    bgColor: "from-rose-500/10 to-pink-500/5",
    borderColor: "border-rose-500/20 hover:border-rose-500/40",
    iconColor: "text-rose-600",
  },
  {
    title: "Utilisateurs",
    description: "Utilisateurs inscrits sur la plateforme des manuscrits",
    iconName: "mdi:account-group-outline",
    path: "/admin/manuscripts-backoffice/users",
    bgColor: "from-blue-500/10 to-indigo-500/5",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-600",
  },
  {
    title: "Statistiques & Rapports",
    description: "Analytics, statistiques de consultation et export des données",
    iconName: "mdi:chart-bar",
    path: "/admin/manuscripts-backoffice/analytics",
    bgColor: "from-indigo-500/10 to-blue-500/5",
    borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
    iconColor: "text-indigo-600",
  },
  {
    title: "Demandes d'accès",
    description: "Consultation sur place, reproduction et demandes de recherche",
    iconName: "mdi:folder-open-outline",
    path: "/admin/manuscripts-backoffice",
    bgColor: "from-emerald-500/10 to-green-500/5",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-600",
  },
  {
    title: "Back-office complet",
    description: "Accès à l'interface d'administration complète des manuscrits",
    iconName: "mdi:view-dashboard-outline",
    path: "/admin/manuscripts-backoffice/dashboard",
    bgColor: "from-gray-500/10 to-slate-500/5",
    borderColor: "border-gray-500/20 hover:border-gray-500/40",
    iconColor: "text-gray-600",
  },
];

export default function ManuscriptsCmsSystem() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Grid des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {adminModules.map((module, index) => (
          <Card
            key={index}
            className={cn(
              "group cursor-pointer transition-all duration-300 flex flex-col",
              "hover:shadow-xl hover:-translate-y-1",
              "border bg-gradient-to-br overflow-hidden",
              module.bgColor,
              module.borderColor
            )}
            onClick={() => navigate(module.path)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-3 rounded-xl bg-white/80 dark:bg-card/80 shadow-sm transition-all duration-300",
                  "group-hover:scale-110"
                )}>
                  <Icon icon={module.iconName} className={cn("h-6 w-6", module.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold leading-tight group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col">
              <CardDescription className="text-sm line-clamp-2 mb-4 flex-1">
                {module.description}
              </CardDescription>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white/60 dark:bg-card/60 border-current/20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
              >
                <Icon icon="mdi:arrow-right" className="h-4 w-4 mr-2" />
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
