import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3,
  Hash,
  Bell,
  TrendingUp,
  Database,
  Search,
  ChevronRight,
  Shield,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSecureRoles } from "@/hooks/useSecureRoles";

interface NavigationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  bgColor: string;
}

interface AdminBackOfficeNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    pending: number;
    validated: number;
    toAttribute: number;
    arbitration?: number;
  };
}

export function AdminBackOfficeNavigation({ activeTab, onTabChange, counts }: AdminBackOfficeNavigationProps) {
  const { isValidator, isAdmin, isLibrarian } = useSecureRoles();
  
  // Éléments de base pour tous les utilisateurs autorisés
  const managementItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Tableau de bord",
      description: "Vue d'ensemble des activités",
      icon: BarChart3,
      color: "text-slate-600",
      bgColor: "bg-slate-50 hover:bg-slate-100",
    },
    // L'onglet Arbitrage est prioritaire pour les validateurs
    ...(isValidator ? [{
      id: "arbitration",
      label: "Arbitrages",
      description: "Demandes nécessitant un arbitrage",
      icon: Scale,
      count: counts.arbitration,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
    }] : []),
    // Les autres onglets ne sont visibles que pour admin/librarian
    ...(isAdmin || isLibrarian ? [
      {
        id: "requests",
        label: "Gestion des Demandes",
        description: "Traitement et validation des demandes",
        icon: FileText,
        count: counts.pending,
        color: "text-blue-600",
        bgColor: "bg-blue-50 hover:bg-blue-100",
      },
      {
        id: "attribution",
        label: "Gestion Attributions N°",
        description: "Attribution des numéros ISBN/ISSN",
        icon: Hash,
        count: counts.toAttribute,
        color: "text-purple-600",
        bgColor: "bg-purple-50 hover:bg-purple-100",
      },
      {
        id: "editorial-monitoring",
        label: "Veille Éditoriale",
        description: "Surveillance des publications",
        icon: Search,
        color: "text-orange-600",
        bgColor: "bg-orange-50 hover:bg-orange-100",
      },
    ] : []),
  ];

  const analyticsItems: NavigationItem[] = [
    {
      id: "notifications",
      label: "Notifications",
      description: "Paramètres de notifications",
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
    },
    {
      id: "statistics",
      label: "Statistiques",
      description: "Analyses et tendances",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
    },
    {
      id: "reports",
      label: "Rapports",
      description: "Génération de rapports",
      icon: Database,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
  ];

  const renderNavItem = (item: NavigationItem) => {
    const isActive = activeTab === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={cn(
          "w-full p-4 rounded-xl border text-left transition-all duration-200",
          isActive
            ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
            : `border-transparent ${item.bgColor}`
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isActive ? "bg-primary text-primary-foreground" : item.color + " bg-white"
          )}>
            <item.icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium truncate",
                isActive ? "text-primary" : "text-foreground"
              )}>
                {item.label}
              </span>
              {item.count !== undefined && item.count > 0 && (
                <Badge 
                  variant={isActive ? "default" : "secondary"} 
                  className="text-xs px-1.5 py-0"
                >
                  {item.count}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate hidden md:block">
              {item.description}
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isActive && "text-primary transform translate-x-1"
          )} />
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Gestion */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Gestion du Dépôt Légal
          </CardTitle>
          <CardDescription className="text-xs">
            Traitement des demandes et attributions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {managementItems.map(renderNavItem)}
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Analyses & Rapports
          </CardTitle>
          <CardDescription className="text-xs">
            Statistiques et exports
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {analyticsItems.map(renderNavItem)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
