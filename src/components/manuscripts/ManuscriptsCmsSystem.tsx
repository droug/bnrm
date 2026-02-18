import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const adminModules = [
  {
    title: "Système de Gestion de Contenu",
    description: "Hero, bannières, médiathèque, styles et design de la plateforme",
    iconName: "mdi:file-image-outline",
    path: "/admin/content-management-manuscrits/cms",
    bgColor: "from-violet-500/10 to-purple-500/5",
    borderColor: "border-violet-500/20 hover:border-violet-500/40",
    iconColor: "text-violet-600",
    countKey: null,
  },
  {
    title: "Gestion des Manuscrits",
    description: "Ajouter, modifier et gérer les manuscrits de la collection numérisée",
    iconName: "mdi:scroll-text-outline",
    path: "/admin/manuscripts-backoffice/documents",
    bgColor: "from-amber-500/10 to-orange-500/5",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    iconColor: "text-amber-600",
    countKey: "manuscripts",
  },
  {
    title: "Gestion des Utilisateurs",
    description: "Comptes utilisateurs, rôles et droits d'accès à la plateforme",
    iconName: "mdi:account-group-outline",
    path: "/admin/manuscripts-backoffice/users",
    bgColor: "from-blue-500/10 to-indigo-500/5",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-600",
    countKey: "users",
  },
  {
    title: "Demandes de partenariat",
    description: "Demandes soumises via le formulaire Devenir Partenaire",
    iconName: "mdi:handshake-outline",
    path: "/admin/content-management-manuscrits/partenariats",
    bgColor: "from-rose-500/10 to-pink-500/5",
    borderColor: "border-rose-500/20 hover:border-rose-500/40",
    iconColor: "text-rose-600",
    countKey: null,
  },
  {
    title: "Statistiques & Rapports",
    description: "Analytics, statistiques de consultation et export des données",
    iconName: "mdi:chart-bar",
    path: "/admin/manuscripts-backoffice/analytics",
    bgColor: "from-indigo-500/10 to-blue-500/5",
    borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
    iconColor: "text-indigo-600",
    countKey: null,
  },
  {
    title: "Expositions Virtuelles",
    description: "Création et gestion des expositions de manuscrits",
    iconName: "mdi:rotate-3d-variant",
    path: "/admin/manuscripts-backoffice/exhibitions",
    bgColor: "from-teal-500/10 to-cyan-500/5",
    borderColor: "border-teal-500/20 hover:border-teal-500/40",
    iconColor: "text-teal-600",
    countKey: null,
  },
  {
    title: "Contrôle d'accès",
    description: "Gestion des niveaux d'accès, permissions et demandes de consultation",
    iconName: "mdi:shield-lock-outline",
    path: "/admin/manuscripts-backoffice/access",
    bgColor: "from-emerald-500/10 to-green-500/5",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-600",
    countKey: null,
  },
  {
    title: "Rapports",
    description: "Génération et export de rapports PDF personnalisés",
    iconName: "mdi:file-chart-outline",
    path: "/admin/manuscripts-backoffice/reports",
    bgColor: "from-orange-500/10 to-red-500/5",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
    iconColor: "text-orange-600",
    countKey: null,
  },
  {
    title: "Paramètres",
    description: "Configuration de la plateforme et options avancées",
    iconName: "mdi:cog-outline",
    path: "/admin/manuscripts-backoffice/settings",
    bgColor: "from-gray-500/10 to-slate-500/5",
    borderColor: "border-gray-500/20 hover:border-gray-500/40",
    iconColor: "text-gray-600",
    countKey: null,
  },
];

export default function ManuscriptsCmsSystem() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["manuscripts-admin-stats"],
    queryFn: async () => {
      const [manuscripts, users] = await Promise.all([
        supabase.from("manuscripts").select("id", { count: "exact" }),
        supabase.from("manuscript_platform_users").select("id", { count: "exact" }),
      ]);
      return {
        manuscripts: manuscripts.count || 0,
        users: users.count || 0,
      };
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {adminModules.map((module, index) => {
        const count = module.countKey ? stats?.[module.countKey as keyof typeof stats] : null;
        return (
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
              <div className="flex items-start justify-between gap-3">
                <div className={cn(
                  "p-3 rounded-xl bg-white/80 dark:bg-card/80 shadow-sm transition-all duration-300",
                  "group-hover:scale-110 shrink-0"
                )}>
                  <Icon icon={module.iconName} className={cn("h-6 w-6", module.iconColor)} />
                </div>
                {count !== null && count !== undefined && (
                  <Badge variant="secondary" className="text-sm px-2.5 py-1 bg-white/60 dark:bg-card/60 border shrink-0">
                    {count}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-semibold leading-tight mt-2 group-hover:text-primary transition-colors">
                {module.title}
              </CardTitle>
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
        );
      })}
    </div>
  );
}
