import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Activity, BarChart3, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ServiceStatusCard } from "@/components/admin/monitoring/ServiceStatusCard";
import { MonitoringOverview } from "@/components/admin/monitoring/MonitoringOverview";
import { ResponseTimeChart } from "@/components/admin/monitoring/ResponseTimeChart";
import { UptimeChart } from "@/components/admin/monitoring/UptimeChart";
import { MatomoWidget } from "@/components/admin/monitoring/MatomoWidget";
import {
  useMonitoredServices,
  useServiceStatus,
  useServiceMetrics,
  useServiceHistory,
  useRunHealthCheck,
} from "@/hooks/useMonitoring";

const MonitoringPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: monitoredServices, isLoading: servicesLoading } = useMonitoredServices();
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useServiceStatus();
  const { data: metricsData, isLoading: metricsLoading } = useServiceMetrics();
  const { data: historyData, isLoading: historyLoading } = useServiceHistory();
  const runHealthCheck = useRunHealthCheck();

  const handleRefresh = async () => {
    try {
      await runHealthCheck.mutateAsync();
      await refetchStatus();
      toast.success("Vérification de santé effectuée");
    } catch (error) {
      toast.error("Erreur lors de la vérification");
    }
  };

  // Calculate overview stats
  const services = statusData?.services || [];
  const metrics = metricsData?.metrics || {};
  
  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;
  const downCount = services.filter((s) => s.status === "down").length;
  
  const avgResponseTime = services.length > 0
    ? Math.round(services.reduce((sum, s) => sum + (s.response_time_ms || 0), 0) / services.length)
    : 0;
  
  const overallUptime = Object.values(metrics).length > 0
    ? Math.round(
        Object.values(metrics).reduce((sum, m) => sum + m.uptime, 0) / Object.values(metrics).length * 100
      ) / 100
    : 100;

  // Merge service info with status
  const enrichedServices = services.map((status) => {
    const serviceInfo = monitoredServices?.find((s) => s.service_name === status.service_name);
    const serviceMetrics = metrics[status.service_name];
    return {
      ...status,
      description: serviceInfo?.description,
      icon: serviceInfo?.icon,
      uptime: serviceMetrics?.uptime,
    };
  });

  const isLoading = servicesLoading || statusLoading || metricsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Back button */}
          <Button variant="ghost" onClick={() => navigate("/admin/settings")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux paramètres
          </Button>
          
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6" />
              Monitoring & Analytics
            </h1>
            <p className="text-muted-foreground">
              Surveillance en temps réel des plateformes et services BNRM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={runHealthCheck.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${runHealthCheck.isPending ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <MonitoringOverview
          totalServices={monitoredServices?.length || 0}
          healthyCount={healthyCount}
          degradedCount={degradedCount}
          downCount={downCount}
          avgResponseTime={avgResponseTime}
          overallUptime={overallUptime}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Service Status Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4">État des services</h2>
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-40" />
                    </Card>
                  ))}
                </div>
              ) : enrichedServices.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun service configuré</p>
                    <p className="text-sm">Lancez une vérification pour collecter les données</p>
                    <Button onClick={handleRefresh} className="mt-4">
                      Lancer la vérification
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrichedServices.map((service) => (
                    <ServiceStatusCard
                      key={service.service_name}
                      serviceName={service.service_name}
                      serviceType={service.service_type}
                      status={service.status}
                      responseTime={service.response_time_ms}
                      lastChecked={service.checked_at}
                      description={service.description}
                      icon={service.icon}
                      uptime={service.uptime}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Matomo Analytics */}
            <MatomoWidget />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MatomoWidget />
            
            <div className="grid lg:grid-cols-2 gap-6">
              <UptimeChart metrics={metrics} />
              <ResponseTimeChart history={historyData?.history || []} />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ResponseTimeChart history={historyData?.history || []} />
              <UptimeChart metrics={metrics} />
            </div>

            {/* Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Détails des performances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-right py-3 px-4">Uptime</th>
                        <th className="text-right py-3 px-4">Temps moyen</th>
                        <th className="text-right py-3 px-4">Vérifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(metrics).map(([name, data]) => (
                        <tr key={name} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">{name}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {monitoredServices?.find((s) => s.service_name === name)?.service_type || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={data.uptime >= 99 ? "text-green-600" : data.uptime >= 95 ? "text-yellow-600" : "text-red-600"}>
                              {data.uptime}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">{data.avg_response_time}ms</td>
                          <td className="py-3 px-4 text-right">{data.total_checks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MonitoringPage;