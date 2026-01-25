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
      color: "bg-violet-100 text-violet-600",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      title: "CMS Expositions 360°",
      description: "Créer et gérer des expositions virtuelles immersives",
      iconName: "mdi:rotate-3d-variant",
      path: "/admin/vexpo360",
      color: "bg-teal-100 text-teal-600",
      gradient: "from-teal-500 to-cyan-600",
    },
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble, KPIs et statistiques",
      iconName: "mdi:view-dashboard-outline",
      path: "/admin/digital-library/dashboard",
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Gestion des documents",
      description: "CRUD, métadonnées Dublin Core/MARC",
      iconName: "mdi:database-outline",
      path: "/admin/digital-library/documents",
      color: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Utilisateurs et droits d'accès",
      iconName: "mdi:account-group-outline",
      path: "/admin/digital-library/users",
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-fuchsia-600",
    },
    {
      title: "Import & Catalogage",
      description: "Import Excel/XML/OAI-PMH",
      iconName: "mdi:upload-outline",
      path: "/admin/digital-library/bulk-import",
      color: "bg-amber-100 text-amber-600",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Statistiques & Rapports",
      description: "Analytics et export XLS/PDF",
      iconName: "mdi:chart-bar",
      path: "/admin/digital-library/analytics",
      color: "bg-indigo-100 text-indigo-600",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      title: "Demandes de reproduction",
      description: "Traitement des demandes",
      iconName: "mdi:image-outline",
      path: "/admin/digital-library/reproduction",
      color: "bg-cyan-100 text-cyan-600",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      title: "Restriction d'accès aux pages",
      description: "Gestion des restrictions par page",
      iconName: "mdi:lock-outline",
      path: "/admin/digital-library/page-restrictions",
      color: "bg-rose-100 text-rose-600",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      title: "Droits d'auteur",
      description: "Gestion des droits",
      iconName: "mdi:copyright",
      path: "/admin/digital-library/copyright",
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-500 to-red-600",
    },
    {
      title: "Gestion des Demandes",
      description: "Réservations et numérisations",
      iconName: "mdi:folder-open-outline",
      path: "/admin/digital-library/requests-management",
      color: "bg-emerald-100 text-emerald-600",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      title: "Bouquets électroniques",
      description: "Configurer les abonnements aux ressources électroniques externes",
      iconName: "mdi:earth",
      path: "/admin/digital-library/electronic-bundles",
      color: "bg-sky-100 text-sky-600",
      gradient: "from-sky-500 to-blue-600",
    },
    {
      title: "Paramètres techniques",
      description: "Connecteurs, OAI-PMH, notifications",
      iconName: "mdi:cog-outline",
      path: "/admin/digital-library/settings",
      color: "bg-gray-100 text-gray-600",
      gradient: "from-gray-500 to-slate-600",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header avec design moderne */}
        <Card className="border-bn-blue-primary/10 mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-bn-blue-primary via-bn-blue-primary/90 to-bn-blue-dark text-white pb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                <Icon icon="mdi:shield-crown" className="h-10 w-10 text-gold-bn-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">
                  Administration
                </CardTitle>
                <CardDescription className="text-white/70 text-base mt-1">
                  Accès aux modules de gestion de la Bibliothèque Numérique Marocaine
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Grid des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {adminModules.map((module, index) => (
            <Card
              key={index}
              className={cn(
                "group cursor-pointer transition-all duration-300",
                "hover:shadow-lg hover:shadow-bn-blue-primary/10 hover:-translate-y-1",
                "border-border/50 overflow-hidden"
              )}
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    module.color,
                    "group-hover:scale-110"
                  )}>
                    <Icon icon={module.iconName} className="h-6 w-6" />
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
                  className="w-full group-hover:bg-bn-blue-primary group-hover:text-white group-hover:border-bn-blue-primary transition-all"
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
