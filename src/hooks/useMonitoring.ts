import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceHealth {
  id: string;
  service_name: string;
  service_type: string;
  status: "healthy" | "degraded" | "down";
  response_time_ms: number;
  status_code: number | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
  checked_at: string;
}

interface MonitoredService {
  id: string;
  service_name: string;
  service_type: string;
  endpoint_url: string | null;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

interface ServiceMetrics {
  uptime: number;
  avg_response_time: number;
  total_checks: number;
  healthy_checks: number;
}

interface MonitoringStatus {
  success: boolean;
  timestamp: string;
  services: ServiceHealth[];
}

interface MonitoringMetrics {
  success: boolean;
  timestamp: string;
  metrics: Record<string, ServiceMetrics>;
}

interface MonitoringHistory {
  success: boolean;
  timestamp: string;
  history: ServiceHealth[];
}

export function useMonitoredServices() {
  return useQuery({
    queryKey: ["monitored-services"],
    queryFn: async (): Promise<MonitoredService[]> => {
      const { data, error } = await supabase
        .from("monitored_services")
        .select("*")
        .order("service_type", { ascending: true })
        .order("service_name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useServiceStatus() {
  return useQuery({
    queryKey: ["service-status"],
    queryFn: async (): Promise<MonitoringStatus> => {
      const { data, error } = await supabase.functions.invoke("monitoring-service", {
        body: null,
        method: "GET",
      });

      // Parse query params for the function
      const response = await fetch(
        `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/monitoring-service?action=status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service status");
      }

      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useServiceMetrics() {
  return useQuery({
    queryKey: ["service-metrics"],
    queryFn: async (): Promise<MonitoringMetrics> => {
      const response = await fetch(
        `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/monitoring-service?action=metrics`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service metrics");
      }

      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useServiceHistory(serviceName?: string, hours: number = 24) {
  return useQuery({
    queryKey: ["service-history", serviceName, hours],
    queryFn: async (): Promise<MonitoringHistory> => {
      const params = new URLSearchParams({ action: "history", hours: hours.toString() });
      if (serviceName) {
        params.set("service", serviceName);
      }

      const response = await fetch(
        `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/monitoring-service?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch service history");
      }

      return response.json();
    },
    refetchInterval: 60000,
  });
}

export function useRunHealthCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `https://safeppmznupzqkqmzjzt.supabase.co/functions/v1/monitoring-service?action=check`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to run health check");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-status"] });
      queryClient.invalidateQueries({ queryKey: ["service-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
    },
  });
}