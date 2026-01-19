import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  BookOpen, 
  Building2, 
  Repeat, 
  Hammer,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface StatsData {
  legalDeposits: number;
  bookReservations: number;
  spaceReservations: number;
  reproductions: number;
  restorations: number;
  pending: number;
  completed: number;
}

interface MySpaceStatsProps {
  stats: StatsData;
  loading?: boolean;
}

export function MySpaceStats({ stats, loading }: MySpaceStatsProps) {
  const statItems = [
    {
      label: "Dépôts légaux",
      value: stats.legalDeposits,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Réservations ouvrages",
      value: stats.bookReservations,
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Réservations espaces",
      value: stats.spaceReservations,
      icon: Building2,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Reproductions",
      value: stats.reproductions,
      icon: Repeat,
      color: "text-orange-600 bg-orange-100",
    },
    {
      label: "Restaurations",
      value: stats.restorations,
      icon: Hammer,
      color: "text-amber-600 bg-amber-100",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems.map((stat) => (
          <Card 
            key={stat.label} 
            className="hover:shadow-md transition-all duration-200 cursor-default group"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé rapide */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{stats.pending}</span>
          </div>
          <span className="text-muted-foreground">en attente</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">{stats.completed}</span>
          </div>
          <span className="text-muted-foreground">terminées</span>
        </div>
      </div>
    </div>
  );
}
