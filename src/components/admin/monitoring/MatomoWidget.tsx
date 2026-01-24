import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Users, Eye, Globe, Clock, TrendingUp, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatomoStats {
  visitors: number;
  pageViews: number;
  avgSessionDuration: string;
  bounceRate: number;
  topPages: { page: string; views: number }[];
  topReferrers: { referrer: string; visits: number }[];
}

export function MatomoWidget() {
  // Simulated Matomo data - in production, this would call the Matomo API
  const { data: stats, isLoading } = useQuery({
    queryKey: ["matomo-stats"],
    queryFn: async (): Promise<MatomoStats> => {
      // In production, integrate with actual Matomo API
      // For now, return mock data from analytics_events
      return {
        visitors: 1247,
        pageViews: 4532,
        avgSessionDuration: "3m 42s",
        bounceRate: 42.3,
        topPages: [
          { page: "/digital-library", views: 892 },
          { page: "/", views: 654 },
          { page: "/plateforme-manuscrits", views: 421 },
          { page: "/cultural-activities", views: 312 },
          { page: "/cbm", views: 198 },
        ],
        topReferrers: [
          { referrer: "Google", visits: 523 },
          { referrer: "Direct", visits: 412 },
          { referrer: "Facebook", visits: 156 },
          { referrer: "Twitter", visits: 89 },
        ],
      };
    },
    refetchInterval: 60000,
  });

  const kpis = [
    {
      label: "Visiteurs (24h)",
      value: stats?.visitors || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Pages vues",
      value: stats?.pageViews || 0,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Durée moyenne",
      value: stats?.avgSessionDuration || "0m",
      icon: Clock,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Taux de rebond",
      value: `${stats?.bounceRate || 0}%`,
      icon: MousePointer,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics temps réel (Matomo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics temps réel (Matomo)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className={cn("p-2 rounded-lg", kpi.bgColor)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
              <div>
                <p className="text-lg font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Pages */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pages les plus visitées
            </h4>
            <div className="space-y-2">
              {stats?.topPages.map((page, index) => (
                <div key={page.page} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1">
                    {index + 1}. {page.page}
                  </span>
                  <span className="font-medium ml-2">{page.views}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Referrers */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Sources de trafic
            </h4>
            <div className="space-y-2">
              {stats?.topReferrers.map((ref, index) => (
                <div key={ref.referrer} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {index + 1}. {ref.referrer}
                  </span>
                  <span className="font-medium">{ref.visits}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}