import { AdminHeader } from "@/components/AdminHeader";
import { WatermarkContainer } from "@/components/ui/watermark";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  List,
  Building2,
  DollarSign,
  FileText,
  Globe,
  Package,
  Users,
  FolderTree,
  Settings,
  ArrowRight
} from "lucide-react";

interface ConfigCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
}

export default function ParametragePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is admin or librarian
  const isAuthorized = user; // TODO: Add proper role check with useSecureRoles

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const configCards: ConfigCard[] = [
    {
      id: "system-lists",
      title: "Systèmes de listes",
      description: "Gérer les listes déroulantes paramétrables du système",
      icon: List,
      href: "/admin/system-lists",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "spaces",
      title: "Espaces et salles",
      description: "Configurer les espaces culturels et salles disponibles",
      icon: Building2,
      href: "/admin/parametrage/espaces",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "pricing",
      title: "Tarifications et charges",
      description: "Définir les tarifs, charges et services",
      icon: DollarSign,
      href: "/admin/parametrage/tarifications",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "documents",
      title: "Modèles de documents",
      description: "Créer et modifier les templates de documents",
      icon: FileText,
      href: "/admin/parametrage/modeles",
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: "languages",
      title: "Langues",
      description: "Gérer les traductions et langues disponibles",
      icon: Globe,
      href: "/admin/parametrage/langues",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      id: "activity-types",
      title: "Types d'activités / équipements",
      description: "Définir les types d'activités et équipements",
      icon: Package,
      href: "/admin/parametrage/types-activites",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      id: "user-profiles",
      title: "Profils et rôles utilisateurs",
      description: "Configurer les rôles et permissions",
      icon: Users,
      href: "/admin/parametrage/profils",
      gradient: "from-rose-500 to-pink-500"
    },
    {
      id: "categories",
      title: "Catégories générales",
      description: "Gérer les catégories de contenu",
      icon: FolderTree,
      href: "/admin/parametrage/categories",
      gradient: "from-amber-500 to-orange-500"
    },
    {
      id: "system-rules",
      title: "Règles et variables système",
      description: "Configurer les paramètres avancés du système",
      icon: Settings,
      href: "/admin/parametrage/regles",
      gradient: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <WatermarkContainer 
      watermarkProps={{ 
        text: "BNRM Administration - Paramétrage Système", 
        variant: "subtle", 
        position: "pattern",
        opacity: 0.02
      }}
    >
      <div className="min-h-screen bg-background">
        <AdminHeader 
          title="Paramétrage et Administration"
          subtitle="Configuration centralisée des listes, paramètres et modèles du système"
        />
        
        <main className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 overflow-hidden"
                  onClick={() => navigate(card.href)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {card.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative">
                    <div className="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors duration-300">
                      <span className="font-medium">Configurer</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info section */}
          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                À propos du paramétrage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ce module centralise tous les paramètres configurables du système BNRM. 
                Les modifications effectuées ici sont immédiatement répercutées dans tous les modules 
                (Réservations, Partenariats, Programmation, etc.) et accessibles aux utilisateurs selon leurs permissions.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </WatermarkContainer>
  );
}
