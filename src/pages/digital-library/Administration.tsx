import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BNPageHeader } from "@/components/digital-library/shared";

export default function Administration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading } = useSecureRoles();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!loading && !isAdmin && !isLibrarian) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      navigate("/digital-library");
    }
  }, [user, isAdmin, isLibrarian, loading, navigate]);

  if (!user || loading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bn-blue-primary"></div>
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          </div>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  const adminModules = [
    {
      title: "Système de Gestion de Contenu",
      description: "CMS complet pour créer et gérer tout le contenu de la plateforme",
      iconName: "mdi:file-image-outline",
      path: "/admin/content-management-BN",
      bgColor: "from-violet-500/10 to-purple-500/5",
      borderColor: "border-violet-500/20 hover:border-violet-500/40",
      iconColor: "text-violet-600",
    },
    {
      title: "CMS Expositions 360°",
      description: "Créer et gérer des expositions virtuelles immersives",
      iconName: "mdi:rotate-3d-variant",
      path: "/admin/vexpo360",
      bgColor: "from-teal-500/10 to-cyan-500/5",
      borderColor: "border-teal-500/20 hover:border-teal-500/40",
      iconColor: "text-teal-600",
    },
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble, KPIs et statistiques",
      iconName: "mdi:view-dashboard-outline",
      path: "/admin/digital-library/dashboard",
      bgColor: "from-blue-500/10 to-indigo-500/5",
      borderColor: "border-blue-500/20 hover:border-blue-500/40",
      iconColor: "text-blue-600",
    },
    {
      title: "Gestion des documents",
      description: "CRUD, métadonnées Dublin Core/MARC",
      iconName: "mdi:database-outline",
      path: "/admin/digital-library/documents",
      bgColor: "from-green-500/10 to-emerald-500/5",
      borderColor: "border-green-500/20 hover:border-green-500/40",
      iconColor: "text-green-600",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Utilisateurs et droits d'accès",
      iconName: "mdi:account-group-outline",
      path: "/admin/digital-library/users",
      bgColor: "from-purple-500/10 to-fuchsia-500/5",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
      iconColor: "text-purple-600",
    },
    {
      title: "Import & Catalogage",
      description: "Import Excel/XML/OAI-PMH",
      iconName: "mdi:upload-outline",
      path: "/admin/digital-library/bulk-import",
      bgColor: "from-amber-500/10 to-orange-500/5",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      iconColor: "text-amber-600",
    },
    {
      title: "Statistiques & Rapports",
      description: "Analytics et export XLS/PDF",
      iconName: "mdi:chart-bar",
      path: "/admin/digital-library/analytics",
      bgColor: "from-indigo-500/10 to-blue-500/5",
      borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
      iconColor: "text-indigo-600",
    },
    {
      title: "Demandes de reproduction",
      description: "Traitement des demandes",
      iconName: "mdi:image-outline",
      path: "/admin/digital-library/reproduction",
      bgColor: "from-cyan-500/10 to-blue-500/5",
      borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
      iconColor: "text-cyan-600",
    },
    {
      title: "Restriction d'accès aux pages",
      description: "Gestion des restrictions par page",
      iconName: "mdi:lock-outline",
      path: "/admin/digital-library/page-restrictions",
      bgColor: "from-rose-500/10 to-pink-500/5",
      borderColor: "border-rose-500/20 hover:border-rose-500/40",
      iconColor: "text-rose-600",
    },
    {
      title: "Droits d'auteur",
      description: "Gestion des droits",
      iconName: "mdi:copyright",
      path: "/admin/digital-library/copyright",
      bgColor: "from-orange-500/10 to-red-500/5",
      borderColor: "border-orange-500/20 hover:border-orange-500/40",
      iconColor: "text-orange-600",
    },
    {
      title: "Gestion des Demandes",
      description: "Réservations et numérisations",
      iconName: "mdi:folder-open-outline",
      path: "/admin/digital-library/requests-management",
      bgColor: "from-emerald-500/10 to-green-500/5",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
      iconColor: "text-emerald-600",
    },
    {
      title: "Bouquets électroniques",
      description: "Configurer les abonnements aux ressources électroniques externes",
      iconName: "mdi:earth",
      path: "/admin/digital-library/electronic-bundles",
      bgColor: "from-sky-500/10 to-blue-500/5",
      borderColor: "border-sky-500/20 hover:border-sky-500/40",
      iconColor: "text-sky-600",
    },
    {
      title: "Paramètres techniques",
      description: "Connecteurs, OAI-PMH, notifications",
      iconName: "mdi:cog-outline",
      path: "/admin/digital-library/settings",
      bgColor: "from-gray-500/10 to-slate-500/5",
      borderColor: "border-gray-500/20 hover:border-gray-500/40",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <BNPageHeader
        title="Administration"
        subtitle="Accès aux modules de gestion de la Bibliothèque Numérique Marocaine"
        icon="mdi:shield-crown"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Grid des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {adminModules.map((module, index) => (
            <Card
              key={index}
              className={cn(
                "group cursor-pointer transition-all duration-300",
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
                    <CardTitle className="text-base font-semibold leading-tight group-hover:text-bn-blue-primary transition-colors">
                      {module.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm line-clamp-2 mb-4">
                  {module.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white/60 dark:bg-card/60 border-current/20 group-hover:bg-bn-blue-primary group-hover:text-white group-hover:border-bn-blue-primary transition-all"
                >
                  <Icon icon="mdi:arrow-right" className="h-4 w-4 mr-2" />
                  Accéder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
