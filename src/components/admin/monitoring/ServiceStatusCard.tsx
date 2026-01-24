import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Activity,
  BookOpen,
  Scroll,
  Library,
  Database,
  Calendar,
  BarChart3,
  Bot,
  Shield,
  HardDrive,
  Server
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceStatusCardProps {
  serviceName: string;
  serviceType: string;
  status: "healthy" | "degraded" | "down";
  responseTime?: number;
  lastChecked?: string;
  description?: string;
  icon?: string;
  uptime?: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Scroll,
  Library,
  Database,
  Calendar,
  BarChart3,
  Bot,
  Shield,
  HardDrive,
  Server,
};

export function ServiceStatusCard({
  serviceName,
  serviceType,
  status,
  responseTime,
  lastChecked,
  description,
  icon,
  uptime,
}: ServiceStatusCardProps) {
  const IconComponent = icon && iconMap[icon] ? iconMap[icon] : Server;

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      label: "Opérationnel",
      badgeVariant: "default" as const,
    },
    degraded: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      label: "Dégradé",
      badgeVariant: "secondary" as const,
    },
    down: {
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      label: "Hors service",
      badgeVariant: "destructive" as const,
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formatLastChecked = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-md", config.borderColor, "border-l-4")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <IconComponent className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{serviceName}</CardTitle>
              <p className="text-xs text-muted-foreground capitalize">{serviceType.replace("_", " ")}</p>
            </div>
          </div>
          <Badge variant={config.badgeVariant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Temps de réponse</p>
              <p className="font-medium">{responseTime !== undefined ? `${responseTime}ms` : "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Uptime 24h</p>
              <p className="font-medium">{uptime !== undefined ? `${uptime}%` : "N/A"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dernière vérification</p>
            <p className="font-medium">{formatLastChecked(lastChecked)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}