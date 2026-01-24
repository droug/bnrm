import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonitoringOverviewProps {
  totalServices: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  avgResponseTime: number;
  overallUptime: number;
}

export function MonitoringOverview({
  totalServices,
  healthyCount,
  degradedCount,
  downCount,
  avgResponseTime,
  overallUptime,
}: MonitoringOverviewProps) {
  const stats = [
    {
      label: "Total Services",
      value: totalServices,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Opérationnels",
      value: healthyCount,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Dégradés",
      value: degradedCount,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Hors service",
      value: downCount,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Temps moyen",
      value: `${avgResponseTime}ms`,
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Uptime global",
      value: `${overallUptime}%`,
      icon: Gauge,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
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
  );
}