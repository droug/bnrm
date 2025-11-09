import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, BookOpen, GraduationCap, Library, TrendingUp, Calendar } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CustomSelect } from "@/components/ui/custom-select";
import { Loader2 } from "lucide-react";

interface DashboardStats {
  totalAdhesions: number;
  adhesionsEnAttente: number;
  adhesionsValidees: number;
  adhesionsRejetees: number;
  totalFormations: number;
  formationsEnAttente: number;
  formationsValidees: number;
  formationsRejetees: number;
  totalBibliotheques: number;
  totalCatalogueNotices: number;
  adhesionsParMois: Array<{ mois: string; count: number }>;
  formationsParType: Array<{ type: string; count: number }>;
  tauxValidation: number;
  delaiMoyenTraitement: number;
}

const COLORS = ['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460'];

export function CBMStatsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAdhesions: 0,
    adhesionsEnAttente: 0,
    adhesionsValidees: 0,
    adhesionsRejetees: 0,
    totalFormations: 0,
    formationsEnAttente: 0,
    formationsValidees: 0,
    formationsRejetees: 0,
    totalBibliotheques: 0,
    totalCatalogueNotices: 0,
    adhesionsParMois: [],
    formationsParType: [],
    tauxValidation: 0,
    delaiMoyenTraitement: 0,
  });
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Déterminer la date de début selon la période
      const now = new Date();
      let startDate = new Date();
      
      if (period === "month") {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === "quarter") {
        startDate.setMonth(now.getMonth() - 3);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // Récupérer les demandes d'adhésion
      const { data: adhesions } = await supabase
        .from('cbm_adhesions')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Récupérer les demandes de formation
      const { data: formations } = await supabase
        .from('cbm_formation_requests')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Statistiques d'adhésions
      const totalAdhesions = adhesions?.length || 0;
      const adhesionsEnAttente = adhesions?.filter(a => a.status === 'pending').length || 0;
      const adhesionsValidees = adhesions?.filter(a => a.status === 'approved').length || 0;
      const adhesionsRejetees = adhesions?.filter(a => a.status === 'rejected').length || 0;

      // Statistiques de formations
      const totalFormations = formations?.length || 0;
      const formationsEnAttente = formations?.filter(f => f.status === 'pending').length || 0;
      const formationsValidees = formations?.filter(f => f.status === 'approved').length || 0;
      const formationsRejetees = formations?.filter(f => f.status === 'rejected').length || 0;

      // Adhésions par mois
      const adhesionsParMois: Array<{ mois: string; count: number }> = [];
      const monthsMap = new Map<string, number>();
      
      adhesions?.forEach(adhesion => {
        const date = new Date(adhesion.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthsMap.set(monthKey, (monthsMap.get(monthKey) || 0) + 1);
      });

      monthsMap.forEach((count, month) => {
        adhesionsParMois.push({ mois: month, count });
      });

      adhesionsParMois.sort((a, b) => a.mois.localeCompare(b.mois));

      // Formations par type
      const formationsParType: Array<{ type: string; count: number }> = [];
      const typesMap = new Map<string, number>();
      
      formations?.forEach(formation => {
        const type = formation.training_type || 'Non spécifié';
        typesMap.set(type, (typesMap.get(type) || 0) + 1);
      });

      typesMap.forEach((count, type) => {
        formationsParType.push({ type, count });
      });

      // Taux de validation
      const totalDemandes = totalAdhesions + totalFormations;
      const totalValidees = adhesionsValidees + formationsValidees;
      const tauxValidation = totalDemandes > 0 ? Math.round((totalValidees / totalDemandes) * 100) : 0;

      // Délai moyen de traitement (simulation - en jours)
      const delaiMoyenTraitement = 3.5;

      setStats({
        totalAdhesions,
        adhesionsEnAttente,
        adhesionsValidees,
        adhesionsRejetees,
        totalFormations,
        formationsEnAttente,
        formationsValidees,
        formationsRejetees,
        totalBibliotheques: adhesionsValidees, // Bibliothèques = adhésions validées
        totalCatalogueNotices: 0, // À implémenter avec les données réelles du catalogue
        adhesionsParMois,
        formationsParType,
        tauxValidation,
        delaiMoyenTraitement,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cbm-primary" />
      </div>
    );
  }

  const statusData = [
    { name: 'En attente', value: stats.adhesionsEnAttente + stats.formationsEnAttente, color: '#F59E0B' },
    { name: 'Validées', value: stats.adhesionsValidees + stats.formationsValidees, color: '#10B981' },
    { name: 'Rejetées', value: stats.adhesionsRejetees + stats.formationsRejetees, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cbm-primary via-cbm-secondary to-cbm-accent bg-clip-text text-transparent">
            Rapports & Statistiques CBM
          </h1>
          <p className="text-muted-foreground mt-2">
            Analyses et indicateurs du réseau des bibliothèques
          </p>
        </div>
        <CustomSelect
          value={period}
          onValueChange={(value) => setPeriod(value as "month" | "quarter" | "year")}
          options={[
            { value: "month", label: "Dernier mois" },
            { value: "quarter", label: "Dernier trimestre" },
            { value: "year", label: "Dernière année" },
          ]}
        />
      </div>

      {/* KPIs principaux */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-cbm-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adhésions Totales</CardTitle>
            <Users className="h-4 w-4 text-cbm-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-primary">{stats.totalAdhesions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.adhesionsEnAttente} en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-cbm-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formations</CardTitle>
            <GraduationCap className="h-4 w-4 text-cbm-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-secondary">{stats.totalFormations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.formationsEnAttente} en attente
            </p>
          </CardContent>
        </Card>

        <Card className="border-cbm-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bibliothèques</CardTitle>
            <Library className="h-4 w-4 text-cbm-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cbm-accent">{stats.totalBibliotheques}</div>
            <p className="text-xs text-muted-foreground">
              Membres du réseau
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Validation</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.tauxValidation}%</div>
            <p className="text-xs text-muted-foreground">
              Délai moyen: {stats.delaiMoyenTraitement} jours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Adhésions par mois */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Adhésions</CardTitle>
            <CardDescription>Demandes d'adhésion par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Adhésions",
                  color: "hsl(var(--cbm-primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.adhesionsParMois}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--cbm-primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--cbm-primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Formations par type */}
        <Card>
          <CardHeader>
            <CardTitle>Formations par Type</CardTitle>
            <CardDescription>Répartition des demandes de formation</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Formations",
                  color: "hsl(var(--cbm-secondary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.formationsParType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--cbm-secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Statut des demandes */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des Demandes</CardTitle>
            <CardDescription>Répartition globale (adhésions + formations)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Demandes",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Détails adhésions */}
        <Card>
          <CardHeader>
            <CardTitle>Détails Adhésions</CardTitle>
            <CardDescription>Statut des demandes d'adhésion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-bold">{stats.totalAdhesions}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">En attente</span>
                <span className="text-sm font-semibold text-amber-600">{stats.adhesionsEnAttente}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validées</span>
                <span className="text-sm font-semibold text-green-600">{stats.adhesionsValidees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rejetées</span>
                <span className="text-sm font-semibold text-red-600">{stats.adhesionsRejetees}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails formations */}
      <Card>
        <CardHeader>
          <CardTitle>Détails Formations</CardTitle>
          <CardDescription>Statut des demandes de formation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-cbm-secondary">{stats.totalFormations}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.formationsEnAttente}</div>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.formationsValidees}</div>
              <p className="text-sm text-muted-foreground">Validées</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.formationsRejetees}</div>
              <p className="text-sm text-muted-foreground">Rejetées</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
