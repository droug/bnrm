import { useState, useEffect } from "react";
import { DigitalLibraryLayout } from "@/components/digital-library/DigitalLibraryLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Users, Eye, Download, TrendingUp, FileText, 
  Settings, Database, Upload, BarChart3, Activity, Globe, Building2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSecureRoles } from "@/hooks/useSecureRoles";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isLibrarian, loading: rolesLoading } = useSecureRoles();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalUsers: 0,
    totalConsultations: 0,
    totalDownloads: 0,
    documentsThisMonth: 0,
    usersThisMonth: 0,
    internalDigitized: 0,
    externalDigitized: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!rolesLoading && !isAdmin && !isLibrarian) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires",
        variant: "destructive",
      });
      navigate("/digital-library");
      return;
    }
    if (isAdmin || isLibrarian) {
      loadStats();
    }
  }, [user, isAdmin, isLibrarian, rolesLoading, navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Load document count
      const { count: docsCount } = await supabase
        .from("content")
        .select("*", { count: "exact", head: true });

      // Load users count
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Load consultation count
      const { count: consultationsCount } = await supabase
        .from("reading_history")
        .select("*", { count: "exact", head: true })
        .eq("action_type", "view");

      // Load downloads count
      const { count: downloadsCount } = await supabase
        .from("reading_history")
        .select("*", { count: "exact", head: true })
        .eq("action_type", "download");

      // Documents this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: docsThisMonth } = await supabase
        .from("content")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      const { count: usersThisMonth } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Collections numérisées par BNRM (internal)
      const { count: internalCount } = await supabase
        .from("digital_library_documents")
        .select("*", { count: "exact", head: true })
        .eq("digitization_source", "internal");

      // Ressources numériques reçues (external)
      const { count: externalCount } = await supabase
        .from("digital_library_documents")
        .select("*", { count: "exact", head: true })
        .eq("digitization_source", "external");

      setStats({
        totalDocuments: docsCount || 0,
        totalUsers: usersCount || 0,
        totalConsultations: consultationsCount || 0,
        totalDownloads: downloadsCount || 0,
        documentsThisMonth: docsThisMonth || 0,
        usersThisMonth: usersThisMonth || 0,
        internalDigitized: internalCount || 0,
        externalDigitized: externalCount || 0,
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || rolesLoading) {
    return (
      <DigitalLibraryLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Chargement...</p>
        </div>
      </DigitalLibraryLayout>
    );
  }

  if (!isAdmin && !isLibrarian) {
    return null;
  }

  // Mock data for charts
  const consultationTrend = [
    { month: "Jan", consultations: 145, downloads: 32 },
    { month: "Fév", consultations: 178, downloads: 41 },
    { month: "Mar", consultations: 203, downloads: 48 },
    { month: "Avr", consultations: 189, downloads: 44 },
    { month: "Mai", consultations: 221, downloads: 56 },
    { month: "Juin", consultations: 267, downloads: 63 },
  ];

  const documentsByType = [
    { type: "Livres", count: 450, color: "#3b82f6" },
    { type: "Manuscrits", count: 280, color: "#8b5cf6" },
    { type: "Périodiques", count: 156, color: "#10b981" },
    { type: "Documents", count: 124, color: "#f59e0b" },
  ];

  const topDocuments = [
    { title: "Al-Muqaddima", consultations: 234, downloads: 45 },
    { title: "Rihla (Voyages)", consultations: 189, downloads: 38 },
    { title: "Histoire du Maroc", consultations: 167, downloads: 41 },
    { title: "Kitab al-Shifa", consultations: 145, downloads: 29 },
    { title: "Es-Saada", consultations: 132, downloads: 26 },
  ];

  const kpis = [
    {
      title: "Documents totaux",
      value: stats.totalDocuments.toLocaleString(),
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `+${stats.documentsThisMonth} ce mois`,
    },
    {
      title: "Utilisateurs",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `+${stats.usersThisMonth} ce mois`,
    },
    {
      title: "Consultations",
      value: stats.totalConsultations.toLocaleString(),
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+18% vs mois dernier",
    },
    {
      title: "Téléchargements",
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      change: "+12% vs mois dernier",
    },
  ];

  const digitizationKpis = [
    {
      title: "Collections numérisées",
      description: "Documents numérisés par la BNRM",
      value: stats.internalDigitized.toLocaleString(),
      icon: Building2,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Ressources numériques",
      description: "Documents reçus déjà numérisés",
      value: stats.externalDigitized.toLocaleString(),
      icon: Globe,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ];

  return (
    <DigitalLibraryLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tableau de bord d'administration
          </h1>
          <p className="text-lg text-muted-foreground">
            Vue d'ensemble et statistiques de la bibliothèque numérique
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/admin/digital-library/documents")}
          >
            <Database className="h-6 w-6" />
            <span className="text-sm">Gérer les documents</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/admin/digital-library/users")}
          >
            <Users className="h-6 w-6" />
            <span className="text-sm">Utilisateurs</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/admin/digital-library/bulk-import")}
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Importer</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col gap-2"
            onClick={() => navigate("/admin/digital-library/settings")}
          >
            <Settings className="h-6 w-6" />
            <span className="text-sm">Paramètres</span>
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold mb-1">{kpi.value}</p>
                  <p className="text-xs text-green-600">{kpi.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Digitization Source KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {digitizationKpis.map((kpi, index) => (
            <Card key={index} className="border-l-4" style={{ borderLeftColor: kpi.color.includes('cyan') ? '#0891b2' : '#14b8a6' }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-xs text-muted-foreground mb-1">{kpi.description}</p>
                    <p className="text-3xl font-bold">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
            <TabsTrigger value="documents">Documents populaires</TabsTrigger>
            <TabsTrigger value="distribution">Répartition</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des consultations et téléchargements</CardTitle>
                <CardDescription>6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={consultationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={2} name="Consultations" />
                    <Line type="monotone" dataKey="downloads" stroke="#10b981" strokeWidth={2} name="Téléchargements" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Popular Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents les plus consultés</CardTitle>
                <CardDescription>Top 5 du mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topDocuments} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consultations" fill="#3b82f6" name="Consultations" />
                    <Bar dataKey="downloads" fill="#10b981" name="Téléchargements" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des documents par type</CardTitle>
                <CardDescription>Vue d'ensemble du catalogue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={documentsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {documentsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-4">
                    {documentsByType.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                          <span className="font-medium">{item.type}</span>
                        </div>
                        <span className="text-2xl font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Nouveau document ajouté", detail: "Histoire du Maroc contemporain", time: "Il y a 2h" },
                { action: "Utilisateur inscrit", detail: "Ahmed Bennani", time: "Il y a 4h" },
                { action: "Import Excel", detail: "125 documents importés", time: "Il y a 5h" },
                { action: "Mise à jour métadonnées", detail: "Manuscrit #1234", time: "Hier" },
                { action: "Export rapport", detail: "Statistiques mensuelles", time: "Hier" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-l-4 border-primary/20 bg-accent/20 rounded">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DigitalLibraryLayout>
  );
}
