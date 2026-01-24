import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
          <div className="flex items-center justify-center gap-2">
            <Icon name="mdi:loading" className="h-5 w-5 animate-spin" />
            <p>Chargement...</p>
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
    },
    {
      title: "CMS Expositions 360°",
      description: "Créer et gérer des expositions virtuelles immersives",
      iconName: "mdi:rotate-3d-variant",
      path: "/admin/vexpo360",
      color: "bg-teal-100 text-teal-600",
    },
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble, KPIs et statistiques",
      iconName: "mdi:view-dashboard-outline",
      path: "/admin/digital-library/dashboard",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Gestion des documents",
      description: "CRUD, métadonnées Dublin Core/MARC",
      iconName: "mdi:database-outline",
      path: "/admin/digital-library/documents",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Utilisateurs et droits d'accès",
      iconName: "mdi:account-group-outline",
      path: "/admin/digital-library/users",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Import & Catalogage",
      description: "Import Excel/XML/OAI-PMH",
      iconName: "mdi:upload-outline",
      path: "/admin/digital-library/bulk-import",
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Statistiques & Rapports",
      description: "Analytics et export XLS/PDF",
      iconName: "mdi:chart-bar",
      path: "/admin/digital-library/analytics",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Demandes de reproduction",
      description: "Traitement des demandes",
      iconName: "mdi:image-outline",
      path: "/admin/digital-library/reproduction",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Restriction d'accès aux pages",
      description: "Gestion des restrictions par page",
      iconName: "mdi:lock-outline",
      path: "/admin/digital-library/page-restrictions",
      color: "bg-rose-100 text-rose-600",
    },
    {
      title: "Droits d'auteur",
      description: "Gestion des droits",
      iconName: "mdi:copyright",
      path: "/admin/digital-library/copyright",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Gestion des Demandes",
      description: "Réservations et numérisations",
      iconName: "mdi:folder-open-outline",
      path: "/admin/digital-library/requests-management",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Bouquets électroniques",
      description: "Configurer les abonnements aux ressources électroniques externes",
      iconName: "mdi:earth",
      path: "/admin/digital-library/electronic-bundles",
      color: "bg-sky-100 text-sky-600",
    },
    {
      title: "Paramètres techniques",
      description: "Connecteurs, OAI-PMH, notifications",
      iconName: "mdi:cog-outline",
      path: "/admin/digital-library/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Administration
          </h1>
          <p className="text-lg text-muted-foreground">
            Accès aux modules de gestion et d'administration de la bibliothèque numérique
          </p>
        </div>

        {/* Digital Library Admin Modules */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Bibliothèque numérique</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((module, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(module.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <Icon name={module.iconName} className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{module.description}</CardDescription>
                  <Button variant="outline" className="w-full mt-4">
                    Accéder
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DigitalLibraryLayout>
  );
}
