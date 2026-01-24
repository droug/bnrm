import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceCheck {
  service_name: string;
  service_type: string;
  endpoint_url: string | null;
}

interface HealthCheckResult {
  service_name: string;
  service_type: string;
  status: "healthy" | "degraded" | "down";
  response_time_ms: number;
  status_code: number | null;
  error_message: string | null;
  metadata: Record<string, unknown>;
}

async function checkEndpoint(
  service: ServiceCheck,
  baseUrl: string
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  let status: "healthy" | "degraded" | "down" = "healthy";
  let statusCode: number | null = null;
  let errorMessage: string | null = null;
  const metadata: Record<string, unknown> = {};

  try {
    if (!service.endpoint_url) {
      // For services without endpoints, just mark as healthy
      return {
        service_name: service.service_name,
        service_type: service.service_type,
        status: "healthy",
        response_time_ms: 0,
        status_code: null,
        error_message: null,
        metadata: { note: "No endpoint configured - assuming healthy" },
      };
    }

    let url = service.endpoint_url;
    if (url.startsWith("/")) {
      url = `${baseUrl}${url}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: service.service_type === "edge_function" ? "OPTIONS" : "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "BNRM-Monitoring-Service/1.0",
      },
    });

    clearTimeout(timeoutId);
    statusCode = response.status;

    if (response.status >= 500) {
      status = "down";
      errorMessage = `HTTP ${response.status}`;
    } else if (response.status >= 400) {
      status = "degraded";
      errorMessage = `HTTP ${response.status}`;
    }

    const responseTime = Date.now() - startTime;
    if (responseTime > 5000) {
      status = status === "healthy" ? "degraded" : status;
      metadata.slow_response = true;
    }

    return {
      service_name: service.service_name,
      service_type: service.service_type,
      status,
      response_time_ms: responseTime,
      status_code: statusCode,
      error_message: errorMessage,
      metadata,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      service_name: service.service_name,
      service_type: service.service_type,
      status: "down",
      response_time_ms: responseTime,
      status_code: null,
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: { error_type: error instanceof Error ? error.name : "UnknownError" },
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "check";

    console.log(`[monitoring-service] Action: ${action}`);

    if (action === "check") {
      // Get all active services to monitor
      const { data: services, error: servicesError } = await supabase
        .from("monitored_services")
        .select("service_name, service_type, endpoint_url")
        .eq("is_active", true);

      if (servicesError) {
        console.error("[monitoring-service] Error fetching services:", servicesError);
        throw servicesError;
      }

      console.log(`[monitoring-service] Checking ${services?.length || 0} services`);

      // Base URL for relative paths
      const baseUrl = supabaseUrl.replace("/rest/v1", "");

      // Run health checks in parallel
      const healthChecks = await Promise.all(
        (services || []).map((service) => checkEndpoint(service, baseUrl))
      );

      // Insert health check results
      const { error: insertError } = await supabase
        .from("service_health_logs")
        .insert(
          healthChecks.map((check) => ({
            service_name: check.service_name,
            service_type: check.service_type,
            status: check.status,
            response_time_ms: check.response_time_ms,
            status_code: check.status_code,
            error_message: check.error_message,
            metadata: check.metadata,
            checked_at: new Date().toISOString(),
          }))
        );

      if (insertError) {
        console.error("[monitoring-service] Error inserting health logs:", insertError);
        throw insertError;
      }

      // Calculate summary
      const summary = {
        total: healthChecks.length,
        healthy: healthChecks.filter((c) => c.status === "healthy").length,
        degraded: healthChecks.filter((c) => c.status === "degraded").length,
        down: healthChecks.filter((c) => c.status === "down").length,
        avg_response_time: Math.round(
          healthChecks.reduce((sum, c) => sum + c.response_time_ms, 0) / healthChecks.length
        ),
      };

      console.log("[monitoring-service] Health check summary:", summary);

      return new Response(
        JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          summary,
          services: healthChecks,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "status") {
      // Get latest status for each service
      const { data: latestStatus, error: statusError } = await supabase
        .from("service_health_logs")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(50);

      if (statusError) {
        throw statusError;
      }

      // Group by service and get latest
      const serviceMap = new Map();
      for (const log of latestStatus || []) {
        if (!serviceMap.has(log.service_name)) {
          serviceMap.set(log.service_name, log);
        }
      }

      const services = Array.from(serviceMap.values());

      return new Response(
        JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          services,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "history") {
      const serviceName = url.searchParams.get("service");
      const hours = parseInt(url.searchParams.get("hours") || "24");

      let query = supabase
        .from("service_health_logs")
        .select("*")
        .gte("checked_at", new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order("checked_at", { ascending: true });

      if (serviceName) {
        query = query.eq("service_name", serviceName);
      }

      const { data: history, error: historyError } = await query;

      if (historyError) {
        throw historyError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          history,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "metrics") {
      // Get aggregated metrics for the last 24 hours
      const { data: metrics, error: metricsError } = await supabase
        .from("service_health_logs")
        .select("service_name, status, response_time_ms, checked_at")
        .gte("checked_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (metricsError) {
        throw metricsError;
      }

      // Calculate uptime and average response time per service
      const serviceMetrics: Record<string, {
        uptime: number;
        avg_response_time: number;
        total_checks: number;
        healthy_checks: number;
      }> = {};

      for (const log of metrics || []) {
        if (!serviceMetrics[log.service_name]) {
          serviceMetrics[log.service_name] = {
            uptime: 0,
            avg_response_time: 0,
            total_checks: 0,
            healthy_checks: 0,
          };
        }

        const sm = serviceMetrics[log.service_name];
        sm.total_checks++;
        if (log.status === "healthy") {
          sm.healthy_checks++;
        }
        sm.avg_response_time += log.response_time_ms;
      }

      // Calculate final metrics
      for (const [name, sm] of Object.entries(serviceMetrics)) {
        sm.uptime = Math.round((sm.healthy_checks / sm.total_checks) * 10000) / 100;
        sm.avg_response_time = Math.round(sm.avg_response_time / sm.total_checks);
      }

      return new Response(
        JSON.stringify({
          success: true,
          timestamp: new Date().toISOString(),
          metrics: serviceMetrics,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[monitoring-service] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});