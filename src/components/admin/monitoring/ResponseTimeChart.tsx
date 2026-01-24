import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useMemo } from "react";

interface HistoryItem {
  service_name: string;
  response_time_ms: number;
  checked_at: string;
  status: string;
}

interface ResponseTimeChartProps {
  history: HistoryItem[];
  selectedServices?: string[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ResponseTimeChart({ history, selectedServices }: ResponseTimeChartProps) {
  const chartData = useMemo(() => {
    // Group data by time (hourly buckets)
    const timeGroups: Record<string, Record<string, number[]>> = {};
    
    for (const item of history) {
      const hour = new Date(item.checked_at).toISOString().slice(0, 13) + ":00";
      if (!timeGroups[hour]) {
        timeGroups[hour] = {};
      }
      if (!timeGroups[hour][item.service_name]) {
        timeGroups[hour][item.service_name] = [];
      }
      timeGroups[hour][item.service_name].push(item.response_time_ms);
    }

    // Convert to chart format with averages
    return Object.entries(timeGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, services]) => {
        const dataPoint: Record<string, unknown> = {
          time: new Date(time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };
        
        for (const [serviceName, times] of Object.entries(services)) {
          const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
          dataPoint[serviceName] = avg;
        }
        
        return dataPoint;
      });
  }, [history]);

  const serviceNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of history) {
      if (!selectedServices || selectedServices.includes(item.service_name)) {
        names.add(item.service_name);
      }
    }
    return Array.from(names);
  }, [history, selectedServices]);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Temps de réponse</CardTitle>
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
        <CardTitle className="text-lg">Temps de réponse (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={false}
              axisLine={false}
              unit="ms"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--background))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}ms`, ""]}
            />
            <Legend />
            {serviceNames.slice(0, 8).map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}