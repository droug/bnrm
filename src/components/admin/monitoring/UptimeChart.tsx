import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useMemo } from "react";

interface ServiceMetrics {
  uptime: number;
  avg_response_time: number;
  total_checks: number;
  healthy_checks: number;
}

interface UptimeChartProps {
  metrics: Record<string, ServiceMetrics>;
}

export function UptimeChart({ metrics }: UptimeChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(metrics)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.slice(0, 15) + "..." : name,
        fullName: name,
        uptime: data.uptime,
        checks: data.total_checks,
      }))
      .sort((a, b) => b.uptime - a.uptime);
  }, [metrics]);

  const getBarColor = (uptime: number) => {
    if (uptime >= 99) return "#22c55e"; // green
    if (uptime >= 95) return "#84cc16"; // lime
    if (uptime >= 90) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  if (Object.keys(metrics).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Uptime par service</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uptime par service (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${props.payload.checks} vérifications)`,
                props.payload.fullName,
              ]}
            />
            <Bar dataKey="uptime" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.uptime)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}