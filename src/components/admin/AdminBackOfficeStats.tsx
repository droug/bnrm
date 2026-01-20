import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Hash,
  TrendingUp
} from "lucide-react";

interface AdminStatsData {
  totalRequests: number;
  pendingRequests: number;
  validatedRequests: number;
  rejectedRequests: number;
  attributedNumbers: number;
  monthlyGrowth: number;
}

interface AdminBackOfficeStatsProps {
  stats: AdminStatsData;
  loading?: boolean;
}

export function AdminBackOfficeStats({ stats, loading }: AdminBackOfficeStatsProps) {
  const statItems = [
    {
      label: "Total demandes",
      value: stats.totalRequests,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "En attente",
      value: stats.pendingRequests,
      icon: Clock,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Validées",
      value: stats.validatedRequests,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      label: "Rejetées",
      value: stats.rejectedRequests,
      icon: AlertCircle,
      color: "text-red-600 bg-red-100",
    },
    {
      label: "N° attribués",
      value: stats.attributedNumbers,
      icon: Hash,
      color: "text-purple-600 bg-purple-100",
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
          <div className="flex items-center gap-1.5 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">+{stats.monthlyGrowth}%</span>
          </div>
          <span className="text-muted-foreground">croissance ce mois</span>
        </div>
      </div>
    </div>
  );
}
