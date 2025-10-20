import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Database, Users, Upload, BarChart3, FileImage,
  Shield, Copyright, Settings, Image
} from "lucide-react";
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
          <p className="text-center">Chargement...</p>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  const adminModules = [
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble, KPIs et statistiques",
      icon: LayoutDashboard,
      path: "/admin/digital-library/dashboard",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Gestion des documents",
      description: "CRUD, métadonnées Dublin Core/MARC",
      icon: Database,
      path: "/admin/digital-library/documents",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Gestion des utilisateurs",
      description: "Utilisateurs et droits d'accès",
      icon: Users,
      path: "/admin/digital-library/users",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Import & Catalogage",
      description: "Import Excel/XML/OAI-PMH",
      icon: Upload,
      path: "/admin/digital-library/bulk-import",
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Statistiques & Rapports",
      description: "Analytics et export XLS/PDF",
      icon: BarChart3,
      path: "/admin/digital-library/analytics",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Expositions virtuelles",
      description: "Gestion des expositions",
      icon: FileImage,
      path: "/admin/digital-library/exhibitions",
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "Demandes de reproduction",
      description: "Traitement des demandes",
      icon: Image,
      path: "/admin/digital-library/reproduction",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Restrictions d'accès",
      description: "Politique de téléchargement",
      icon: Shield,
      path: "/admin/digital-library/restrictions",
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Droits d'auteur",
      description: "Gestion des droits",
      icon: Copyright,
      path: "/admin/digital-library/copyright",
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Paramètres techniques",
      description: "Connecteurs, OAI-PMH, notifications",
      icon: Settings,
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
                      <module.icon className="h-6 w-6" />
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
