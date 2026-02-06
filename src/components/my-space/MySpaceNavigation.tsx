import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BookOpen, 
  Building2, 
  Repeat, 
  Hammer,
  History,
  Heart,
  Bookmark,
  MessageSquare,
  ChevronRight,
  Gift,
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  bgColor: string;
}

interface UserProfiles {
  isProfessional?: boolean;  // Dépôt légal
  isDonor?: boolean;         // Mécénat
  isValidator?: boolean;     // Arbitrage
  hasRestorations?: boolean;
  hasReproductions?: boolean;
  hasBookReservations?: boolean;
  hasSpaceReservations?: boolean;
}

interface MySpaceNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    restoration: number;
    reproduction: number;
    legalDeposit: number;
    bookReservation: number;
    spaceReservation: number;
    history: number;
    favorites: number;
    bookmarks: number;
    reviews: number;
    mecenat?: number;
    arbitration?: number;
  };
  userProfiles?: UserProfiles;
}

export function MySpaceNavigation({ activeTab, onTabChange, counts, userProfiles }: MySpaceNavigationProps) {
  // Build request items based on user profile
  const requestsItems: NavigationItem[] = [];

  // Always show restoration if user has requests or count > 0
  if (userProfiles?.hasRestorations || counts.restoration > 0) {
    requestsItems.push({
      id: "restoration",
      label: "Restauration",
      description: "Demandes de restauration de documents",
      icon: Hammer,
      count: counts.restoration,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
    });
  }

  // Show reproduction if user has requests
  if (userProfiles?.hasReproductions || counts.reproduction > 0) {
    requestsItems.push({
      id: "reproduction",
      label: "Reproduction",
      description: "Demandes de reproduction",
      icon: Repeat,
      count: counts.reproduction,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    });
  }

  // Show legal deposit only for professionals
  if (userProfiles?.isProfessional) {
    requestsItems.push({
      id: "legal-deposit",
      label: "Dépôt légal",
      description: "Suivi des dépôts légaux",
      icon: FileText,
      count: counts.legalDeposit,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    });
  }

  // Show book reservation if user has reservations
  if (userProfiles?.hasBookReservations || counts.bookReservation > 0) {
    requestsItems.push({
      id: "book-reservation",
      label: "Réservation ouvrage",
      description: "Réservations de livres et documents",
      icon: BookOpen,
      count: counts.bookReservation,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 hover:bg-emerald-100",
    });
  }

  // Show space reservation if user has reservations
  if (userProfiles?.hasSpaceReservations || counts.spaceReservation > 0) {
    requestsItems.push({
      id: "space-reservation",
      label: "Réservation espace",
      description: "Réservations d'espaces culturels",
      icon: Building2,
      count: counts.spaceReservation,
      color: "text-purple-600",
      bgColor: "bg-purple-50 hover:bg-purple-100",
    });
  }

  // Show mecenat only for donors
  if (userProfiles?.isDonor) {
    requestsItems.push({
      id: "mecenat",
      label: "Mécénat",
      description: "Donations et propositions de dons",
      icon: Gift,
      count: counts.mecenat,
      color: "text-rose-600",
      bgColor: "bg-rose-50 hover:bg-rose-100",
    });
  }

  // Show arbitration only for validators
  if (userProfiles?.isValidator) {
    requestsItems.push({
      id: "arbitration",
      label: "Arbitrages",
      description: "Demandes d'arbitrage à traiter",
      icon: Scale,
      count: counts.arbitration,
      color: "text-amber-600",
      bgColor: "bg-amber-50 hover:bg-amber-100",
    });
  }

  const actionsItems: NavigationItem[] = [
    {
      id: "history",
      label: "Historique",
      description: "Historique de consultation",
      icon: History,
      count: counts.history,
      color: "text-slate-600",
      bgColor: "bg-slate-50 hover:bg-slate-100",
    },
    {
      id: "favorites",
      label: "Favoris",
      description: "Documents favoris",
      icon: Heart,
      count: counts.favorites,
      color: "text-rose-600",
      bgColor: "bg-rose-50 hover:bg-rose-100",
    },
    {
      id: "bookmarks",
      label: "Marque-pages",
      description: "Pages sauvegardées",
      icon: Bookmark,
      count: counts.bookmarks,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 hover:bg-indigo-100",
    },
    {
      id: "reviews",
      label: "Évaluations",
      description: "Vos avis et commentaires",
      icon: MessageSquare,
      count: counts.reviews,
      color: "text-teal-600",
      bgColor: "bg-teal-50 hover:bg-teal-100",
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
      {/* Demandes - only show if there are items */}
      {requestsItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Suivi des demandes
            </CardTitle>
            <CardDescription className="text-xs">
              Consultez l'état de vos demandes
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {requestsItems.map(renderNavItem)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Historique & Actions
          </CardTitle>
          <CardDescription className="text-xs">
            Votre activité et préférences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {actionsItems.map(renderNavItem)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
