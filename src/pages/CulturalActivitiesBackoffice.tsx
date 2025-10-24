import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCulturalActivitiesAuth } from "@/hooks/useCulturalActivitiesAuth";
import { Navigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Handshake, FileText, BarChart3, FileType, ArrowRight, Building2, DollarSign, Globe, Wrench, UserCog, FolderTree, Settings, Workflow } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CulturalActivitiesBackoffice = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAuthorized, loading } = useCulturalActivitiesAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          <Skeleton className="h-8 w-[350px] mb-4" />
          <Skeleton className="h-4 w-[500px] mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[200px]" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  const sections = [
    {
      title: "Tableau de bord",
      description: "Vue d'ensemble et indicateurs de performance",
      icon: BarChart3,
      path: "/admin/activites-culturelles/dashboard",
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Réservations d'espaces",
      description: "Gestion des demandes de réservation",
      icon: Calendar,
      path: "/admin/activites-culturelles/reservations",
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "Visites guidées",
      description: "Planification et suivi des visites",
      icon: Users,
      path: "/admin/activites-culturelles/visites",
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Partenariats",
      description: "Collaboration et conventions",
      icon: Handshake,
      path: "/admin/activites-culturelles/partenariats",
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      title: "Programmation culturelle",
      description: "Événements et activités proposées",
      icon: FileText,
      path: "/admin/activites-culturelles/programmation",
      color: "bg-gradient-to-br from-pink-500 to-pink-600"
    },
    {
      title: "Modèles de documents",
      description: "Génération automatique de documents",
      icon: FileType,
      path: "/admin/activites-culturelles/templates",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    },
    {
      title: "Espaces et salles",
      description: "Configuration des espaces disponibles",
      icon: Building2,
      path: "/admin/activites-culturelles/espaces",
      color: "bg-gradient-to-br from-teal-500 to-teal-600"
    },
    {
      title: "Tarifications et charges",
      description: "Gestion des tarifs et frais",
      icon: DollarSign,
      path: "/admin/activites-culturelles/tarifications",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
    },
    {
      title: "Langues",
      description: "Configuration des langues disponibles",
      icon: Globe,
      path: "/admin/activites-culturelles/langues",
      color: "bg-gradient-to-br from-sky-500 to-sky-600"
    },
    {
      title: "Types d'activités et équipements",
      description: "Gestion des types d'activités et équipements standards",
      icon: Wrench,
      path: "/admin/activites-culturelles/types-activites",
      color: "bg-gradient-to-br from-violet-500 to-violet-600"
    },
    {
      title: "Workflow & BPM",
      description: "Configuration et suivi du workflow de réservation",
      icon: Workflow,
      path: "/admin/workflow-bpm?tab=cultural-activities",
      color: "bg-gradient-to-br from-rose-500 to-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Administration des Activités Culturelles
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestion centralisée de la plateforme d'activités culturelles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.path}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary/50 overflow-hidden"
                onClick={() => navigate(section.path)}
              >
                <div className={`h-2 ${section.color} transition-all duration-300 group-hover:h-3`} />
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${section.color} text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="font-medium">Accéder</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CulturalActivitiesBackoffice;
